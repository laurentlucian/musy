import { and, count, desc, eq, sql, sum } from "drizzle-orm";
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
  const [platforms, [totals], coverage] = await Promise.all([
    db
      .select({
        platform: historyEvent.platform,
        listens: count(),
        msPlayed: sum(historyEvent.msPlayed),
      })
      .from(historyEvent)
      .where(eq(historyEvent.userId, userId))
      .groupBy(historyEvent.platform),
    db
      .select({ listens: count(), msPlayed: sum(historyEvent.msPlayed) })
      .from(historyEvent)
      .where(eq(historyEvent.userId, userId)),
    db
      .select({
        country: historyEvent.country,
        listens: count(),
        msPlayed: sum(historyEvent.msPlayed),
      })
      .from(historyEvent)
      .where(eq(historyEvent.userId, userId))
      .groupBy(historyEvent.country),
  ]);
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

export async function getLocationSongs(
  userId: string,
  page: number,
  country: string | null = null,
) {
  const code = normalizeCountry(country);
  const where = and(
    eq(historyEvent.userId, userId),
    country !== null
      ? code
        ? eq(sql`UPPER(TRIM(${historyEvent.country}))`, code)
        : sql`0`
      : undefined,
  );
  const [[total], songs] = await Promise.all([
    db.select({ count: count() }).from(historyEvent).where(where),
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
      .orderBy(desc(historyEvent.playedAt), desc(historyEvent.id))
      .limit(50)
      .offset(page * 50),
  ]);
  return {
    total: total.count,
    songs: songs.map(({ platform, ...song }) => ({
      ...song,
      device: deviceLabel(platform),
    })),
  };
}
