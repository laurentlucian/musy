import { prisma } from "@lib/services/db.server";
import { getAllUsersId } from "@lib/services/db/users.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { createTrackModel } from "@lib/services/sdk/spotify/spotify.server";
import { log, logError, notNull } from "@lib/utils";
import invariant from "tiny-invariant";

export async function syncPlaybacks() {
  log("starting...", "playback");

  const users = await getAllUsersId();

  const playbacks = await Promise.all(
    users.map((userId) => getPlaybackState(userId)),
  );
  const active = playbacks.filter((u) => notNull(u.playback));

  log(`users active: ${active.length}`, "playback");

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) log("same track", "playback");
    if (!track || track.type !== "track" || isSameTrack) continue;
    log("new track", "playback");

    await upsertPlayback(userId, playback).catch(() =>
      log("prisma update failed", "playback"),
    );
    log("prisma updated", "playback");
    // const remaining = track.duration_ms - progress_ms;

    // schedulePlaybackCheck(userId, remaining);

    // log("created playbackQ job with delay", msToString(remaining));
  }

  handleInactiveUsers(
    playbacks.filter((u) => !notNull(u.playback)).map((u) => u.id),
  );

  log("completed", "playback");
}

async function handleInactiveUsers(users: string[]) {
  await prisma.playback.deleteMany({ where: { userId: { in: users } } });
}

const upsertPlayback = async (
  userId: string,
  playback: SpotifyApi.CurrentPlaybackResponse,
) => {
  const { progress_ms: progress, timestamp } = playback;
  if (
    !playback.item ||
    playback.item.type !== "track" ||
    !progress ||
    !timestamp
  )
    return;

  const track = createTrackModel(playback.item);
  const data = {
    progress,
    timestamp: BigInt(timestamp),
    track: {
      connectOrCreate: {
        create: track,
        where: {
          id: track.id,
        },
      },
    },
  };

  await prisma.playback.upsert({
    create: {
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    update: {
      ...data,
    },
    where: {
      userId,
    },
  });
};

async function getPlaybackState(id: string) {
  try {
    const spotify = await SpotifyService.createFromUserId(id);
    const client = spotify.getClient();
    invariant(client, "Spotify API not found");
    const { body: playback } = await client.getMyCurrentPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== "track")
      return { id, playback: null };

    return { id, playback };
  } catch (error) {
    logError(`error getting playback state for ${id}`);
    if (error instanceof Error && error.message.includes("revoked")) {
      logError(error.message);
      await prisma.provider.update({
        data: { revoked: true },
        where: { userId_type: { userId: id, type: "spotify" } },
      });
    }

    // @ts-expect-error e is ResponseError
    if (error?.statusCode === 403) {
      await prisma.provider.update({
        data: { revoked: true },
        where: { userId_type: { userId: id, type: "spotify" } },
      });
    }

    return { id, playback: null };
  }
}
