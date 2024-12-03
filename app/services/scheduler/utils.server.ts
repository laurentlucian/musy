import invariant from "tiny-invariant";
import { prisma } from "../db.server";
import { SpotifyService } from "../sdk/spotify.server";
import { createTrackModel } from "../sdk/spotify/spotify.server";

export const upsertPlayback = async (
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

export const getPlaybackState = async (id: string) => {
  try {
    const spotify = await SpotifyService.createFromUserId(id);
    const client = spotify.getClient();
    invariant(client, "Spotify API not found");
    const { body: playback } = await client.getMyCurrentPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== "track")
      return { id, playback: null };
    return { id, playback };
  } catch (e) {
    if (e instanceof Error && e.message.includes("revoked")) {
      await prisma.provider.update({
        data: { revoked: true },
        where: { userId_type: { userId: id, type: "spotify" } },
      });
      // await prisma.queue.deleteMany({
      //   where: { OR: [{ userId: id }, { ownerId: id }] },
      // });
      // await prisma.likedSongs.deleteMany({ where: { userId: id } });
    }

    // @ts-expect-error e is ResponseError
    if (e?.statusCode === 403) {
      await prisma.provider.update({
        data: { revoked: true },
        where: { userId_type: { userId: id, type: "spotify" } },
      });
      // await prisma.queue.deleteMany({ where: { OR: [{ userId: id }, { ownerId: id }] } });
      // await prisma.likedSongs.deleteMany({ where: { userId: id } });
      // await prisma.recentSongs.deleteMany({ where: { userId: id } });
      // await prisma.recommendedSongs.deleteMany({
      //   where: { OR: [{ senderId: id }, { ownerId: id }] },
      // });
      // await prisma.aI.delete({ where: { userId: id } });
      // await prisma.settings.delete({ where: { userId: id } });
      // await prisma.profile.delete({ where: { userId: id } });
      // await prisma.user.delete({ where: { id } });
    }

    return { id, playback: null };
  }
};
