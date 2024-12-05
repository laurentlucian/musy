import debug from "debug";
import { notNull } from "~/lib/utils";
import { prisma } from "~/services/db.server";
import { getAllUsersId } from "~/services/prisma/users.server";
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
