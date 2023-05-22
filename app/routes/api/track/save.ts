import type { ActionArgs } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getCurrentUser } from '~/services/prisma/users.server';
import { getSavedStatus, spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const id = form.get('userId');
  const trackId = form.get('trackId');
  const isSaved = form.get('state') === 'true';
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || !currentUser || typeof id !== 'string') {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);
  const data: Prisma.LikedSongsCreateInput = {
    action: 'liked',
    track: {
      connectOrCreate: {
        create: trackDb,
        where: {
          id: track.id,
        },
      },
    },
    user: {
      connect: {
        userId: currentUser.userId,
      },
    },
  };

  const [isSavedCheck] = await getSavedStatus(id, trackId);
  if (isSavedCheck !== isSaved) {
    if (isSavedCheck) {
      await prisma.likedSongs.create({ data });
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
