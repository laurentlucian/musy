import type { LikedSongs } from '@prisma/client';
import type { ActionArgs } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { getCurrentUser } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { getSavedStatus, spotifyApi } from '~/services/spotify.server';

export const action = async ({ request, params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const trackId = data.get('trackId');
  const isSaved = data.get('state') === 'true';
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || !currentUser) {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  const { body: track } = await spotify.getTrack(trackId);
  const song: Omit<LikedSongs, 'id'> = {
    trackId: track.id,
    likedAt: new Date(),
    userId: currentUser.userId,
    name: track.name,
    uri: track.uri,
    albumName: track.album.name,
    albumUri: track.album.uri,
    artist: track.artists[0].name,
    artistUri: track.artists[0].uri,
    image: track.album.images[0].url,
    explicit: track.explicit,
    action: 'liked',
  };

  const [isSavedCheck] = await getSavedStatus(id, trackId);
  if (isSavedCheck !== isSaved) {
    if (isSavedCheck) {
      await prisma.likedSongs.create({
        data: song,
      });
    } else {
      await prisma.likedSongs.delete({
        where: {
          trackId_userId: {
            userId: currentUser.userId,
            trackId,
          },
        },
      });
    }

    return typedjson('Error: State mismatch');
  }

  if (isSaved) {
    try {
      await spotify.removeFromMySavedTracks([trackId]);
      await prisma.likedSongs.delete({
        where: {
          trackId_userId: {
            userId: currentUser.userId,
            trackId,
          },
        },
      });
      return typedjson('Removed');
    } catch (error) {
      return typedjson('error: Reauthenticate');
    }
  } else {
    try {
      await spotify.addToMySavedTracks([trackId]);
      await prisma.likedSongs.create({
        data: song,
      });
      return typedjson('Saved');
    } catch (error) {
      return typedjson('error: Reauthenticate');
    }
  }
};
