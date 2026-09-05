import { and, asc, desc, eq, sql } from "drizzle-orm";
import { countryName, normalizeCountry } from "~/lib/countries";
import { deviceLabel } from "~/lib/device";
import { historyEvent } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";

export type ListeningCountry = {
  code: string;
  label: string;
  listens: number;
  msPlayed: number;
};

export function summarizeDevices(
  rows: { platform: string | null; listens: number; msPlayed: number }[],
) {
  const devices = new Map<
    string,
    { label: string; listens: number; msPlayed: number }
  >();
  for (const row of rows) {
    const label = deviceLabel(row.platform);
    const device = devices.get(label) ?? { label, listens: 0, msPlayed: 0 };
    device.listens += Number(row.listens);
    device.msPlayed += Number(row.msPlayed);
    devices.set(label, device);
  }
  return [...devices.values()].sort((a, b) => b.msPlayed - a.msPlayed);
}

export async function getHistoryInsights(userId: string) {
  const rows = await db.all<{
    kind: string;
    value: string;
    listens: number;
    msPlayed: number;
  }>(
    sql`SELECT kind, value, listens, msPlayed FROM HistoryExploreSummary WHERE userId=${userId}`,
  );
  const platforms = rows
    .filter((row) => row.kind === "platform")
    .map((row) => ({ ...row, platform: row.value }));
  const totals = rows.find((row) => row.kind === "total");
  const coverage = rows
    .filter((row) => row.kind === "country")
    .map((row) => ({ ...row, country: row.value }));
  const countries = new Map<string, ListeningCountry>();
  let located = 0;
  for (const row of coverage) {
    const code = normalizeCountry(row.country);
    if (!code) continue;
    located += row.listens;
    const country = countries.get(code) ?? {
      code,
      label: countryName(code),
      listens: 0,
      msPlayed: 0,
    };
    country.listens += row.listens;
    country.msPlayed += Number(row.msPlayed ?? 0);
    countries.set(code, country);
  }
  return {
    devices: summarizeDevices(
      platforms.map((row) => ({ ...row, msPlayed: Number(row.msPlayed) })),
    ),
    listens: totals?.listens ?? 0,
    msPlayed: Number(totals?.msPlayed ?? 0),
    located,
    countries: [...countries.values()].sort(
      (a, b) => b.listens - a.listens || a.code.localeCompare(b.code),
    ),
  };
}

export type HistoryCursor = { playedAt: string; id: string };

export function parseHistoryCursor(value: string | null): HistoryCursor | null {
  if (!value) return null;
  if (value.length > 1000) throw new Error("Invalid cursor");
  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed.playedAt !== "string" ||
      !Number.isFinite(Date.parse(parsed.playedAt)) ||
      typeof parsed.id !== "string" ||
      !parsed.id ||
      parsed.id.length > 200
    )
      throw new Error("Invalid cursor");
    return { playedAt: parsed.playedAt, id: parsed.id };
  } catch {
    throw new Error("Invalid cursor");
  }
}

export async function getLocationSongs(
  userId: string,
  cursor: HistoryCursor | null = null,
  country: string | null = null,
  previous = false,
) {
  const code = normalizeCountry(country);
  const where = and(
    eq(historyEvent.userId, userId),
    country !== null
      ? code
        ? eq(sql`UPPER(TRIM(${historyEvent.country}))`, code)
        : sql`0`
      : undefined,
    cursor
      ? previous
        ? sql`(${historyEvent.playedAt}, ${historyEvent.id}) > (${cursor.playedAt}, ${cursor.id})`
        : sql`(${historyEvent.playedAt}, ${historyEvent.id}) < (${cursor.playedAt}, ${cursor.id})`
      : undefined,
  );
  const order = previous ? asc : desc;
  const [totals, rows] = await Promise.all([
    db.all<{ listens: number }>(
      sql`SELECT listens FROM HistoryExploreSummary WHERE userId=${userId} AND kind=${country === null ? "total" : "country"} AND value=${country === null ? "" : (code ?? "!invalid")}`,
    ),
    db
      .select({
        id: historyEvent.id,
        trackId: historyEvent.trackId,
        trackName: historyEvent.trackName,
        artistName: historyEvent.artistName,
        playedAt: historyEvent.playedAt,
        msPlayed: historyEvent.msPlayed,
        platform: historyEvent.platform,
      })
      .from(historyEvent)
      .where(where)
      .orderBy(order(historyEvent.playedAt), order(historyEvent.id))
      .limit(51),
  ]);
  const more = rows.length > 50;
  const songs = rows.slice(0, 50);
  if (previous) songs.reverse();
  const encode = (song: HistoryCursor | undefined) =>
    song ? JSON.stringify({ playedAt: song.playedAt, id: song.id }) : null;
  return {
    total: totals[0]?.listens ?? 0,
    next: (!previous ? more : Boolean(cursor)) ? encode(songs.at(-1)) : null,
    previous: (previous ? more : Boolean(cursor)) ? encode(songs[0]) : null,
    songs: songs.map(({ platform, ...song }) => ({
      ...song,
      device: deviceLabel(platform),
    })),
  };
}
