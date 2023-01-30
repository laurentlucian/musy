// import type { LikedSongs } from '@prisma/client';
import type { ActionArgs } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { getCurrentUser } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { getSavedStatus, spotifyApi } from '~/services/spotify.server';

export const action = async ({ params, request }: ActionArgs) => {
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
    action: 'liked',

    albumName: track.album.name,
    albumUri: track.album.uri,
    artist: track.artists[0].name,
    artistUri: track.artists[0].uri,
    duration: track.duration_ms,
    explicit: track.explicit,
    image: track.album.images[0].url,
    likedAt: new Date(),
    link: track.external_urls.spotify,
    name: track.name,
    preview_url: track.preview_url,
    track: {
      connectOrCreate: {
        create: trackDb,
        where: {
          id: track.id,
        },
      },
    },

    uri: track.uri,
    user: {
      connect: {
        userId: currentUser.userId,
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
            trackId,
            userId: currentUser.userId,
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
            trackId,
            userId: currentUser.userId,
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
