// import type { LikedSongs } from '@prisma/client';
import { getSavedStatus, spotifyApi } from '~/services/spotify.server';
import { getCurrentUser } from '~/services/auth.server';
import type { ActionArgs } from '@remix-run/node';
import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

export const action = async ({ request, params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const form = await request.formData();
  const trackId = form.get('trackId');
  const isSaved = form.get('state') === 'true';
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || !currentUser) {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);
  const data = {
    likedAt: new Date(),

    name: track.name,
    uri: track.uri,
    albumName: track.album.name,
    albumUri: track.album.uri,
    artist: track.artists[0].name,
    artistUri: track.artists[0].uri,
    image: track.album.images[0].url,
    explicit: track.explicit,
    preview_url: track.preview_url,
    link: track.external_urls.spotify,
    duration: track.duration_ms,
    action: 'liked',

    user: {
      connect: {
        userId: currentUser.userId,
      },
    },
    track: {
      connectOrCreate: {
        create: trackDb,
        where: {
          id: track.id,
        },
      },
    },
  };

  const [isSavedCheck] = await getSavedStatus(id, trackId);
  if (isSavedCheck !== isSaved) {
    if (isSavedCheck) {
      await prisma.likedSongs.create({
        data: data,
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
        data,
      });
      return typedjson('Saved');
    } catch (error) {
      return typedjson('error: Reauthenticate');
    }
  }
};
