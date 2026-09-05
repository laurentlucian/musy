type ArchiveEnv = { D1: D1Database; HISTORY_ARCHIVES: R2Bucket };

export async function sha256(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function storeHistoryArchive(
  env: ArchiveEnv,
  userId: string,
  value: unknown,
) {
  const body = JSON.stringify(value);
  const checksum = await sha256(body);
  const key = `users/${encodeURIComponent(userId)}/history/${checksum}.json`;
  await env.HISTORY_ARCHIVES.put(key, body, {
    httpMetadata: { contentType: "application/json" },
    customMetadata: { sha256: checksum },
  });
  const stored = await env.HISTORY_ARCHIVES.get(key);
  if (!stored || (await sha256(await stored.text())) !== checksum)
    throw new Error("History archive verification failed.");
  return { key, checksum };
}

export async function archiveHistoryChunk(env: ArchiveEnv, userId: string) {
  const { results } = await env.D1.prepare(
    "SELECT id,rawJson FROM HistoryEvent WHERE userId=? AND archiveKey IS NULL ORDER BY id LIMIT 500",
  )
    .bind(userId)
    .all<{ id: string; rawJson: string }>();
  if (!results.length) return false;
  const archive = await storeHistoryArchive(
    env,
    userId,
    results.map((row) => ({ id: row.id, record: JSON.parse(row.rawJson) })),
  );
  const groups: string[][] = [[]];
  let bytes = 2;
  const encoder = new TextEncoder();
  for (const [offset, row] of results.entries()) {
    const entry = JSON.stringify({ ...row, offset });
    const size = encoder.encode(entry).byteLength + 1;
    if (bytes + size > 512 * 1024 && groups.at(-1)!.length) {
      groups.push([]);
      bytes = 2;
    }
    groups.at(-1)!.push(entry);
    bytes += size;
  }
  await env.D1.batch(
    groups.map((entries) =>
      env.D1.prepare(
        `UPDATE HistoryEvent INDEXED BY sqlite_autoindex_HistoryEvent_1 SET archiveKey=?,archiveChecksum=?,archiveOffset=json_extract(a.value,'$.offset'),rawJson=''
     FROM json_each(?) AS a
     WHERE HistoryEvent.userId=? AND HistoryEvent.id=json_extract(a.value,'$.id') AND HistoryEvent.archiveKey IS NULL AND HistoryEvent.rawJson=json_extract(a.value,'$.rawJson')`,
      ).bind(archive.key, archive.checksum, `[${entries.join(",")}]`, userId),
    ),
  );
  return true;
}

export async function readHistoryArchive(
  env: ArchiveEnv,
  userId: string,
  key: string,
  checksum: string,
) {
  if (!key.startsWith(`users/${encodeURIComponent(userId)}/history/`))
    throw new Error("Invalid history archive owner.");
  const stored = await env.HISTORY_ARCHIVES.get(key);
  if (!stored) throw new Error("History archive missing.");
  const body = await stored.text();
  if ((await sha256(body)) !== checksum)
    throw new Error("History archive checksum mismatch.");
  return JSON.parse(body) as unknown;
}

export async function deleteHistoryArchives(env: ArchiveEnv, userId: string) {
  const prefix = `users/${encodeURIComponent(userId)}/history/`;
  let cursor: string | undefined;
  do {
    const page = await env.HISTORY_ARCHIVES.list({
      prefix,
      cursor,
      limit: 1000,
    });
    if (page.objects.length)
      await env.HISTORY_ARCHIVES.delete(
        page.objects.map((object) => object.key),
      );
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}
