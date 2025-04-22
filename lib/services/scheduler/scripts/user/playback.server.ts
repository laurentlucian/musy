import { prisma } from "@lib/services/db.server";
import { getAllUsersId } from "@lib/services/db/users.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { log, notNull } from "@lib/utils";
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
    const { item } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === item?.id;
    if (!item || item.type !== "track" || isSameTrack) continue;
    log("new track", "playback");

    await upsertPlayback(userId, playback);

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
  try {
    log("upserting playback", "playback");
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
  } catch {
    log("failure upserting playback", "playback");
  }
};

async function getPlaybackState(id: string) {
  try {
    const spotify = await getSpotifyClient({ userId: id });

    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== "track")
      return { id, playback: null };

    return { id, playback };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("revoked")) {
        log(`revoked token for ${id}`, "playback");
        await prisma.provider.update({
          data: { revoked: true },
          where: { userId_type: { userId: id, type: "spotify" } },
        });
      } else {
        log(`unknown: ${error.message}`, "playback");
      }
    } else {
      log(`unknown: ${error}`, "playback");
    }
  }

  return { id, playback: null };
}
