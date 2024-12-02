import { Cron } from "croner";
import debug from "debug";
import { msToString, notNull } from "~/lib/utils";
import { prisma } from "~/services/db.server";
import { getAllUsersId } from "~/services/prisma/users.server";
import { getSpotifyClient } from "~/services/spotify.server";
import { getPlaybackState, upsertPlayback } from "../../utils.server";

const log = debug("musy:playback");

export async function syncPlaybacks() {
  log("starting...");

  const users = await getAllUsersId();
  const playbacks = await Promise.all(
    users.map((userId) => getPlaybackState(userId)),
  );
  const active = playbacks.filter((u) => notNull(u.playback));

  log("users active", active.length, active.map(({ id }) => id).join(", "));

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) log("same track", userId);
    if (!track || track.type !== "track" || isSameTrack) continue;
    log("new track", userId);

    await upsertPlayback(userId, playback).catch((e) =>
      log("prisma update failed: ", e),
    );
    log("prisma updated");
    // const remaining = track.duration_ms - progress_ms;

    // schedulePlaybackCheck(userId, remaining);

    // log("created playbackQ job with delay", msToString(remaining));
  }

  handleInactiveUsers(
    playbacks.filter((u) => !notNull(u.playback)).map((u) => u.id),
  );

  log("completed");
}

async function handleInactiveUsers(users: string[]) {
  await prisma.playback.deleteMany({ where: { userId: { in: users } } });
}

function _schedulePlaybackCheck(userId: string, delay: number) {
  new Cron(
    new Date(Date.now() + delay),
    async () => {
      const { spotify } = await getSpotifyClient(userId);
      if (!spotify) {
        log(`exiting; spotify client not found for user ${userId}`);
        return;
      }

      const { body: playback } = await spotify.getMyCurrentPlaybackState();

      if (!playback || !playback.is_playing) {
        log("user not playing, will be cleaned up on next createPlaybackQ run");
        return;
      }

      const { item: track, progress_ms } = playback;

      if (!track || track.type !== "track" || !progress_ms) {
        log(
          "user not playing a track, will be cleaned up on next createPlaybackQ run",
        );
        return;
      }

      await upsertPlayback(userId, playback);
      log("playback upserted for user", userId);

      const remaining = track.duration_ms - progress_ms;
      let delay: number;

      if (playback.repeat_state === "track") {
        delay = 1000 * 60 * 5; // Check again in 5 minutes for repeated tracks
        log("track on repeat, will check again in 5 minutes");
      } else {
        delay = remaining + 1000; // Add 1 second buffer
        log("will check again at the end of the track");
      }

      // Schedule the next check
      _schedulePlaybackCheck(userId, delay);

      log(
        "completed check for",
        userId,
        "will check again in",
        msToString(delay),
      );
    },
    {
      maxRuns: 1,
    },
  );
}
