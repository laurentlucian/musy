import {
  and,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lte,
  sql,
  sum,
} from "drizzle-orm";
import { countryName, normalizeCountry } from "~/lib/countries";
import { deviceLabel } from "~/lib/device";
import { geoIp, historyEvent, historyGeoJob } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";

export type MapBounds = [number, number, number, number];
export type ListeningLocation = {
  latitude: number;
  longitude: number;
  label: string;
  listens: number;
  msPlayed: number;
};

export function parseBounds(value: string | null): MapBounds | null {
  if (!value || value.split(",").some((part) => !part.trim())) return null;
  const values = value.split(",").map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite)) return null;
  const [west, south, east, north] = values;
  if (
    west < -180 ||
    east > 180 ||
    south < -90 ||
    north > 90 ||
    west > east ||
    south > north
  )
    return null;
  return values as MapBounds;
}

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
  const [platforms, locations, [totals], coverage, [job]] = await Promise.all([
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
      .select({
        latitude: geoIp.latitude,
        longitude: geoIp.longitude,
        city: geoIp.city,
        region: geoIp.region,
        country: geoIp.country,
        listens: count(),
        msPlayed: sum(historyEvent.msPlayed),
      })
      .from(historyEvent)
      .innerJoin(geoIp, eq(historyEvent.ip, geoIp.ip))
      .where(
        and(
          eq(historyEvent.userId, userId),
          eq(geoIp.status, "located"),
          isNotNull(geoIp.latitude),
          isNotNull(geoIp.longitude),
        ),
      )
      .groupBy(
        geoIp.latitude,
        geoIp.longitude,
        geoIp.city,
        geoIp.region,
        geoIp.country,
      ),
    db
      .select({ listens: count(), msPlayed: sum(historyEvent.msPlayed) })
      .from(historyEvent)
      .where(eq(historyEvent.userId, userId)),
    db
      .select({
        country: historyEvent.country,
        ipLocated: sql<number>`CASE WHEN ${geoIp.status} = 'located' AND ${geoIp.latitude} IS NOT NULL AND ${geoIp.longitude} IS NOT NULL THEN 1 ELSE 0 END`,
        listens: count(),
        msPlayed: sum(historyEvent.msPlayed),
      })
      .from(historyEvent)
      .leftJoin(geoIp, eq(historyEvent.ip, geoIp.ip))
      .where(eq(historyEvent.userId, userId))
      .groupBy(
        historyEvent.country,
        sql`CASE WHEN ${geoIp.status} = 'located' AND ${geoIp.latitude} IS NOT NULL AND ${geoIp.longitude} IS NOT NULL THEN 1 ELSE 0 END`,
      ),
    db
      .select({
        status: historyGeoJob.status,
        error: historyGeoJob.error,
        retryAt: historyGeoJob.retryAt,
      })
      .from(historyGeoJob)
      .where(eq(historyGeoJob.userId, userId))
      .limit(1),
  ]);
  const countries = new Map<
    string,
    { code: string; label: string; listens: number; msPlayed: number }
  >();
  let located = 0;
  let ipLocated = 0;
  for (const row of coverage) {
    const code = normalizeCountry(row.country);
    if (code || row.ipLocated) located += row.listens;
    if (row.ipLocated) ipLocated += row.listens;
    if (!code) continue;
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
    locations: locations.map(
      (row): ListeningLocation => ({
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        label:
          [row.city, row.region, row.country].filter(Boolean).join(", ") ||
          "Approximate location",
        listens: row.listens,
        msPlayed: Number(row.msPlayed),
      }),
    ),
    listens: totals?.listens ?? 0,
    msPlayed: Number(totals?.msPlayed ?? 0),
    located,
    ipLocated,
    countries: [...countries.values()].sort(
      (a, b) => b.listens - a.listens || a.code.localeCompare(b.code),
    ),
    job: job ?? null,
  };
}

export async function getLocationSongs(
  userId: string,
  bounds: MapBounds | null,
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
    bounds
      ? and(
          eq(geoIp.status, "located"),
          gte(sql`CAST(${geoIp.longitude} AS REAL)`, bounds[0]),
          gte(sql`CAST(${geoIp.latitude} AS REAL)`, bounds[1]),
          lte(sql`CAST(${geoIp.longitude} AS REAL)`, bounds[2]),
          lte(sql`CAST(${geoIp.latitude} AS REAL)`, bounds[3]),
        )
      : undefined,
  );
  const [[total], songs] = await Promise.all([
    db
      .select({ count: count() })
      .from(historyEvent)
      .leftJoin(geoIp, eq(historyEvent.ip, geoIp.ip))
      .where(where),
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
      .leftJoin(geoIp, eq(historyEvent.ip, geoIp.ip))
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
