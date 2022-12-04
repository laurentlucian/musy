import type { LikedSongs } from '@prisma/client';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import type { SpotifyApiWithUser } from '~/services/spotify.server';
import { spotifyApi } from '~/services/spotify.server';

export const likedQ = Queue<{ userId: string }>('update_liked', async (job) => {
  console.log('likedQ -> pending job starting...');
  const { userId } = job.data;
  const profile = await prisma.user.findUnique({ where: { id: userId }, include: { user: true } });

  if (!profile || !profile.user) {
    console.log('likedQ -> user not found');
    return null;
  }

  let spotifyWithUser: SpotifyApiWithUser | undefined;

  try {
    spotifyWithUser = await spotifyApi(userId);
  } catch (err) {
    console.warn('likedQ -> User Access Revoked for userId', userId);
    return;
  }

  if (!spotifyWithUser || !spotifyWithUser.spotify) {
    console.log('likedQ -> spotifyWithUser null for userId', userId);
    return null;
  }

  const { spotify } = spotifyWithUser;

  const { body: liked } = await spotify.getMySavedTracks({ limit: 50 });

  for (const track of liked.items) {
    console.log('likedQ -> adding track to db', track.track.id);

    const song: Omit<LikedSongs, 'id'> = {
      trackId: track.track.id,
      likedAt: new Date(track.added_at),
      userId: userId,
      name: track.track.name,
      uri: track.track.uri,
      albumName: track.track.album.name,
      albumUri: track.track.album.uri,
      artist: track.track.artists[0].name,
      artistUri: track.track.artists[0].uri,
      image: track.track.album.images[0].url,
      explicit: track.track.explicit,
    };

    await prisma.likedSongs.upsert({
      where: {
        trackId_userId: {
          trackId: track.track.id,
          userId: userId,
        },
      },
      update: song,
      create: song,
    });

    likedQ.add(
      'update_liked',
      { userId },
      {
        // 1 hour in ms
        delay: 1000 * 60 * 60,
      },
    );
  }
});
