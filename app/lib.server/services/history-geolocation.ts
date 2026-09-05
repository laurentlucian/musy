import { env } from "cloudflare:workers";
import { isIP } from "node:net";
import {
  and,
  count,
  desc,
  eq,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
} from "drizzle-orm";
import { geoIp, historyEvent, historyGeoJob } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";

const LEASE_MS = 5 * 60_000;

export function validCoordinates(
  latitude: unknown,
  longitude: unknown,
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

async function enqueue(userId: string, delaySeconds = 0) {
  try {
    await env.DELIVERY_QUEUE.send(
      { type: "history-geolocation", userId },
      { delaySeconds: Math.min(43_200, delaySeconds) },
    );
  } catch {
    // Minute cron recovers the persisted job.
  }
}

export async function startHistoryLocations(userId: string) {
  await db
    .insert(historyGeoJob)
    .values({ userId, status: "queued", updatedAt: Date.now() })
    .onConflictDoNothing();
  await db
    .update(historyGeoJob)
    .set({
      status: "queued",
      attempts: 0,
      retryAt: 0,
      error: null,
      updatedAt: Date.now(),
    })
    .where(
      and(
        eq(historyGeoJob.userId, userId),
        or(
          eq(historyGeoJob.status, "complete"),
          eq(historyGeoJob.status, "failed"),
        ),
      ),
    );
  await enqueue(userId);
}

export async function recoverHistoryLocations() {
  const now = Date.now();
  const jobs = await db
    .select({ userId: historyGeoJob.userId })
    .from(historyGeoJob)
    .where(
      or(
        and(
          eq(historyGeoJob.status, "queued"),
          lte(historyGeoJob.retryAt, now),
        ),
        and(
          eq(historyGeoJob.status, "running"),
          lt(historyGeoJob.updatedAt, now - LEASE_MS),
        ),
      ),
    )
    .limit(100);
  for (const job of jobs) await enqueue(job.userId);
}

class LocationError extends Error {
  constructor(
    message: string,
    readonly delay: number,
    readonly rateLimited = false,
  ) {
    super(message);
  }
}

export async function processHistoryLocations(userId: string) {
  const now = Date.now();
  const lease = crypto.randomUUID();
  const [job] = await db
    .update(historyGeoJob)
    .set({ status: "running", lease, updatedAt: now })
    .where(
      and(
        eq(historyGeoJob.userId, userId),
        or(
          and(
            eq(historyGeoJob.status, "queued"),
            lte(historyGeoJob.retryAt, now),
          ),
          and(
            eq(historyGeoJob.status, "running"),
            lt(historyGeoJob.updatedAt, now - LEASE_MS),
          ),
        ),
      ),
    )
    .returning();
  if (!job) return;
  const owned = and(
    eq(historyGeoJob.userId, userId),
    eq(historyGeoJob.lease, lease),
  );
  try {
    const ips = await db
      .select({ ip: historyEvent.ip, listens: count() })
      .from(historyEvent)
      .leftJoin(geoIp, eq(historyEvent.ip, geoIp.ip))
      .where(
        and(
          eq(historyEvent.userId, userId),
          isNotNull(historyEvent.ip),
          isNull(geoIp.ip),
        ),
      )
      .groupBy(historyEvent.ip)
      .orderBy(desc(count()))
      .limit(10);
    for (const { ip } of ips) {
      if (!ip) continue;
      let location: Record<string, unknown> = { success: false };
      if (isIP(ip)) {
        const response = await fetch(
          `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,message,latitude,longitude,city,region,country`,
          { signal: AbortSignal.timeout(10_000) },
        );
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const seconds = Number(retryAfter);
          const delay =
            retryAfter && Number.isFinite(seconds)
              ? seconds
              : retryAfter
                ? (Date.parse(retryAfter) - Date.now()) / 1000
                : 86_400;
          throw new LocationError(
            "Location service limit reached. Retrying later.",
            Number.isFinite(delay) ? Math.max(60, Math.ceil(delay)) : 86_400,
            true,
          );
        }
        if (!response.ok)
          throw new LocationError(
            "Location service unavailable. Retrying.",
            300,
          );
        location = await response.json();
      }
      const located =
        location.success === true &&
        validCoordinates(location.latitude, location.longitude);
      await db
        .insert(geoIp)
        .values({
          ip,
          status: located ? "located" : "unavailable",
          updatedAt: Date.now(),
          latitude: located ? String(location.latitude) : null,
          longitude: located ? String(location.longitude) : null,
          city:
            located && typeof location.city === "string" ? location.city : null,
          region:
            located && typeof location.region === "string"
              ? location.region
              : null,
          country:
            located && typeof location.country === "string"
              ? location.country
              : null,
        })
        .onConflictDoNothing();
    }
    const status = ips.length < 10 ? "complete" : "queued";
    await db
      .update(historyGeoJob)
      .set({
        status,
        lease: null,
        attempts: 0,
        retryAt: 0,
        error: null,
        updatedAt: Date.now(),
      })
      .where(owned);
    if (status === "queued") await enqueue(userId, 2);
  } catch (error) {
    const attempts =
      error instanceof LocationError && error.rateLimited
        ? job.attempts
        : job.attempts + 1;
    const delay =
      error instanceof LocationError
        ? error.delay
        : Math.min(3600, 60 * 2 ** attempts);
    const status = attempts >= 5 ? "failed" : "queued";
    await db
      .update(historyGeoJob)
      .set({
        status,
        attempts,
        lease: null,
        updatedAt: Date.now(),
        retryAt: Date.now() + delay * 1000,
        error:
          error instanceof LocationError
            ? error.message
            : "Locations unavailable. Try again.",
      })
      .where(owned);
    if (status === "queued") await enqueue(userId, delay);
  }
}
