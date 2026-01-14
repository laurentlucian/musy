import { and, desc, eq } from "drizzle-orm";
import { log } from "~/components/utils";
import {
  artistToTopArtists,
  sync,
  top,
  topArtists,
  topTracks,
  topTracksToTrack,
} from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import {
  transformArtists,
  transformTracks,
} from "~/lib.server/services/sdk/helpers/spotify";
import type { Spotified } from "~/lib.server/services/sdk/spotify";
import { generateId } from "~/lib.server/services/utils";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const ranges = ["short_term", "medium_term", "long_term"] as const;

export async function syncUserTop({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  const recentSync = await db.query.sync.findFirst({
    where: and(
      eq(sync.userId, userId),
      eq(sync.type, "top"),
      eq(sync.state, "success"),
    ),
    orderBy: desc(sync.updatedAt),
  });

  if (recentSync) {
    const updatedAt = new Date(recentSync.updatedAt).getTime();
    const now = Date.now();
    if (now - updatedAt < SYNC_COOLDOWN_MS) {
      log("skipped - recent sync exists", "top");
      return;
    }
  }

  try {
    for (const range of ranges) {
      log("syncing", `top_${range}`);
      await syncTopTracks({ userId, spotify, range });
      await syncTopArtists({ userId, spotify, range });
    }

    log("completed", "top");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "top",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
  } catch (error) {
    log(`failure:${error}`, "top");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "top",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
      });
  }
}

async function syncTopTracks({
  userId,
  spotify,
  range,
}: {
  userId: string;
  spotify: Spotified;
  range: (typeof ranges)[number];
}) {
  const response = await spotify.user.getUserTopItems("tracks", {
    limit: 50,
    time_range: range,
  });

  const trackIds = await transformTracks(response.items, spotify);

  const existing = await db.query.topTracks.findFirst({
    where: eq(topTracks.userId, userId),
    orderBy: desc(topTracks.createdAt),
  });

  const newList = trackIds.join(",");
  if (existing?.trackIds === newList) {
    log("skipped", `top_${range}`);
    return;
  }

  const now = new Date().toISOString();
  const topTracksId = generateId();

  // First ensure the top record exists
  await db.insert(top).values({ userId }).onConflictDoNothing();

  // Create the top tracks record
  await db.insert(topTracks).values({
    id: topTracksId,
    userId,
    type: range,
    trackIds: newList,
    createdAt: now,
  });

  // Create many-to-many relationships (2 columns = max 45 per batch for safety)
  if (trackIds.length > 0) {
    const relations = trackIds.map((trackId) => ({
      a: topTracksId,
      b: trackId,
    }));
    const batchSize = 45;
    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      await db.insert(topTracksToTrack).values(batch);
    }
  }
}

async function syncTopArtists({
  userId,
  spotify,
  range,
}: {
  userId: string;
  spotify: Spotified;
  range: (typeof ranges)[number];
}) {
  const response = await spotify.user.getUserTopItems("artists", {
    limit: 50,
    time_range: range,
  });

  const artistIds = await transformArtists(response.items, spotify);

  const existing = await db.query.topArtists.findFirst({
    where: eq(topArtists.userId, userId),
    orderBy: desc(topArtists.createdAt),
  });

  const newList = artistIds.join(",");
  if (existing?.artistIds === newList) {
    log("skipped", `top_${range}`);
    return;
  }

  const now = new Date().toISOString();
  const topArtistsId = generateId();

  // First ensure the top record exists
  await db.insert(top).values({ userId }).onConflictDoNothing();

  // Create the top artists record
  await db.insert(topArtists).values({
    id: topArtistsId,
    userId,
    type: range,
    artistIds: newList,
    createdAt: now,
  });

  // Create many-to-many relationships (2 columns = max 45 per batch for safety)
  if (artistIds.length > 0) {
    const relations = artistIds.map((artistId) => ({
      a: artistId,
      b: topArtistsId,
    }));
    const batchSize = 45;
    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      await db.insert(artistToTopArtists).values(batch);
    }
  }
}
