import debug from 'debug';
import { prisma } from '~/services/db.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';
import { syncPlaybacks } from './playback.server';

const debugUserQ = debug('userQ');
export const debugLikedQ = debugUserQ.extend('likedQ');
export const debugFollowQ = debugUserQ.extend('followQ');
export const debugProfileQ = debugUserQ.extend('profileQ');
export const debugRecentQ = debugUserQ.extend('recentQ');
export const debugPlaylistQ = debugUserQ.extend('playlistQ');
export const debugTopQ = debugUserQ.extend('topQ');

export async function syncUsers() {
  const users = await getAllUsersId();
  debugUserQ('Starting to process all users', { totalUsers: users.length });

  for (const userId of users) {
    await processUser(userId);
  }

  debugUserQ('Completed processing all users');

  await syncPlaybacks()
    .catch(debugUserQ)
    .then(() => debugUserQ('playback_creator added'));
}

async function processUser(userId: string) {
  debugUserQ('Processing user', userId);

  const profile = await prisma.user.findUnique({
    include: { user: true },
    where: { id: userId },
  });

  const { spotify } = await getSpotifyClient(userId);

  if (!profile || !profile.user || !spotify) {
    debugUserQ(`User ${userId} skipped -> user not found or invalid Spotify client`);
    return;
  }

  // await Promise.all([
  //   recentQ.add('update_recent', { userId }),
  //   likedQ.add('update_liked', { userId }),
  //   followQ.add('update_follow', { userId }),
  //   profileQ.add('update_profile', { userId }),
  //   playlistQ.add('update_playlist', { userId }),
  //   topQ.add('update_top', { userId }),
  // ]);

  debugUserQ('Completed processing user', userId);
}
