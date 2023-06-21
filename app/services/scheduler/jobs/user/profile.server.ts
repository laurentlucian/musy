import { updateUserImage, updateUserName } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';

export const profileQ = Queue<{ userId: string }>('update_profile', async (job) => {
  const { userId } = job.data;
  console.log('userQ -> profileQ -> starting...', userId);

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    console.log('userQ -> profileQ -> no spotify client');
    return;
  }

  const spotifyProfile = await spotify.getMe();

  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(userId, pfp[0].url);
  }

  const name = spotifyProfile?.body.display_name;
  if (name) {
    await updateUserName(userId, name);
  }

  console.log('userQ -> profileQ -> completed');
});
