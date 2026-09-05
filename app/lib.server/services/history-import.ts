import { env } from "cloudflare:workers";

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function field(row: Record<string, unknown>, key: string, limit = 1000) {
  const value = row[key];
  if (value == null) return null;
  if (typeof value !== "string" || value.length > limit)
    throw new Error(`Invalid ${key}.`);
  return value;
}

export function normalizeHistoryRow(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid listening record.");
  const row = value as Record<string, unknown>;
  const uri = field(row, "spotify_track_uri");
  if (!uri || !/^spotify:track:[A-Za-z0-9]{22}$/.test(uri)) return null;
  const timestamp = field(row, "ts");
  const date = timestamp ? new Date(timestamp) : null;
  if (
    !date ||
    !Number.isFinite(date.getTime()) ||
    date.getTime() < 0 ||
    date.getTime() > Date.now() + 86400000
  )
    throw new Error("Invalid listening date.");
  if (
    typeof row.ms_played !== "number" ||
    !Number.isSafeInteger(row.ms_played) ||
    row.ms_played < 0 ||
    row.ms_played > 86400000
  )
    throw new Error("Invalid listening duration.");
  const rawJson = canonicalJson(row);
  if (rawJson.length > 16384) throw new Error("Listening record too large.");
  return {
    trackId: uri.slice(14),
    uri,
    playedAt: date.toISOString(),
    msPlayed: row.ms_played,
    trackName: field(row, "master_metadata_track_name") || "Unknown track",
    artistName:
      field(row, "master_metadata_album_artist_name") || "Unknown artist",
    albumName:
      field(row, "master_metadata_album_album_name") || "Unknown album",
    ip: field(row, "ip_addr_decrypted", 100) || field(row, "ip_addr", 100),
    platform: field(row, "platform"),
    country: field(row, "conn_country", 100),
    rawJson,
  };
}

export async function getHistoryImport(userId: string) {
  return env.D1.prepare(
    `SELECT h.jobId, h.status, h.updatedAt, COALESCE(SUM(b.imported),0) imported, COALESCE(SUM(b.duplicates),0) duplicates, COALESCE(SUM(b.skipped),0) skipped FROM HistoryImport h LEFT JOIN HistoryImportBatch b ON b.userId=h.userId AND b.jobId=h.jobId WHERE h.userId=? GROUP BY h.userId`,
  )
    .bind(userId)
    .first();
}

export async function importHistoryBatch(
  userId: string,
  jobId: string,
  batchId: string,
  rows: unknown[],
) {
  const normalized = rows.map(normalizeHistoryRow);
  const events = normalized.filter((row) => row !== null);
  const id = await hash(`${userId}\n${jobId}\n${batchId}`);
  const payloadHash = await hash(canonicalJson(rows));
  const previous = await env.D1.prepare(
    "SELECT imported,duplicates,skipped,payloadHash FROM HistoryImportBatch WHERE id=? AND userId=?",
  )
    .bind(id, userId)
    .first();
  if (previous) {
    if (previous.payloadHash !== payloadHash)
      throw new Error("Invalid batch: contents changed. Start a new import.");
    return { ...previous, import: await getHistoryImport(userId) };
  }
  const statements: D1PreparedStatement[] = [
    env.D1.prepare(
      "INSERT OR IGNORE INTO HistoryImportBatch(id,userId,jobId,imported,duplicates,skipped,payloadHash) VALUES (?,?,?,0,0,0,?)",
    ).bind(id, userId, jobId, payloadHash),
  ];
  for (const row of events) {
    const eventId = await hash(`${userId}\n${row.rawJson}`);
    const artistId = `history:${await hash(row.artistName)}`;
    statements.push(
      env.D1.prepare(
        "INSERT OR IGNORE INTO Artist(id,uri,name,image,popularity,followers,genres) SELECT ?,'',?,'',0,0,'[]' WHERE EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?)",
      ).bind(artistId, row.artistName, id, payloadHash),
      env.D1.prepare(
        "INSERT OR IGNORE INTO Track(id,uri,name,image,explicit,link,duration,provider) SELECT ?,?,?,'',0,?,0,'spotify' WHERE EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?)",
      ).bind(
        row.trackId,
        row.uri,
        row.trackName,
        `https://open.spotify.com/track/${row.trackId}`,
        id,
        payloadHash,
      ),
      env.D1.prepare(
        "INSERT OR IGNORE INTO _TrackToArtist(trackId,artistId) SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM _TrackToArtist WHERE trackId=?) AND EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?)",
      ).bind(row.trackId, artistId, row.trackId, id, payloadHash),
      env.D1.prepare(
        "INSERT OR IGNORE INTO HistoryEvent(id,userId,batchId,trackId,trackName,artistName,albumName,playedAt,msPlayed,ip,platform,country,rawJson) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?)",
      ).bind(
        eventId,
        userId,
        id,
        row.trackId,
        row.trackName,
        row.artistName,
        row.albumName,
        row.playedAt,
        row.msPlayed,
        row.ip,
        row.platform,
        row.country,
        row.rawJson,
        id,
        payloadHash,
      ),
      env.D1.prepare(
        "UPDATE RecentTracks SET historyEventId=?,msPlayed=? WHERE userId=? AND trackId=? AND playedAt=? AND historyEventId IS NULL AND EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?) AND NOT EXISTS (SELECT 1 FROM RecentTracks WHERE historyEventId=?)",
      ).bind(
        eventId,
        row.msPlayed,
        userId,
        row.trackId,
        row.playedAt,
        id,
        payloadHash,
        eventId,
      ),
      env.D1.prepare(
        "INSERT OR IGNORE INTO RecentTracks(userId,trackId,playedAt,msPlayed,historyEventId) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?)",
      ).bind(
        userId,
        row.trackId,
        row.playedAt,
        row.msPlayed,
        eventId,
        id,
        payloadHash,
      ),
    );
  }
  statements.push(
    env.D1.prepare(
      "UPDATE HistoryImportBatch SET imported=(SELECT COUNT(*) FROM HistoryEvent WHERE batchId=?),duplicates=?-(SELECT COUNT(*) FROM HistoryEvent WHERE batchId=?),skipped=? WHERE id=? AND payloadHash=?",
    ).bind(id, events.length, id, rows.length - events.length, id, payloadHash),
    env.D1.prepare(
      "INSERT INTO HistoryImport(userId,jobId,status,updatedAt) SELECT ?,?,'running',? WHERE EXISTS (SELECT 1 FROM HistoryImportBatch WHERE id=? AND payloadHash=?) ON CONFLICT(userId) DO UPDATE SET jobId=excluded.jobId,status='running',updatedAt=excluded.updatedAt",
    ).bind(userId, jobId, Date.now(), id, payloadHash),
  );
  await env.D1.batch(statements);
  const counts = await env.D1.prepare(
    "SELECT imported,duplicates,skipped,payloadHash FROM HistoryImportBatch WHERE id=?",
  )
    .bind(id)
    .first();
  if (counts?.payloadHash !== payloadHash)
    throw new Error("Invalid batch: contents changed. Start a new import.");
  return { ...counts, import: await getHistoryImport(userId) };
}

export async function completeHistoryImport(userId: string, jobId: string) {
  await env.D1.prepare(
    "UPDATE HistoryImport SET status='processing',statsYear=-1,statsUpdatedAt=0,updatedAt=? WHERE userId=? AND jobId=? AND status='running'",
  )
    .bind(Date.now(), userId, jobId)
    .run();
  const progress = await getHistoryImport(userId);
  if (progress?.jobId === jobId && progress.status === "processing")
    await env.DELIVERY_QUEUE.send({ type: "history-stats", userId, jobId });
  return progress;
}
