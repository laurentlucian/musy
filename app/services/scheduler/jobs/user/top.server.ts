import { transformTracks } from '~/services/prisma/spotify.server';
import { Queue } from '../../queue.server';
import { getUserSpotify } from '~/services/spotify.server';
import { redis } from '../../redis.server';
import { debugTopQ } from '../user.server';

export const topQ = Queue<{ userId: string }>('update_top', async (job) => {
  const { userId } = job.data;
  debugTopQ('starting...');
  const { spotify } = await getUserSpotify(userId);

  const getUserSpotifyTop = async (range: 'short_term' | 'medium_term' | 'long_term') => {
    const response = await spotify
      .getMyTopTracks({ limit: 50, time_range: range })
      .then((data) => data.body.items)
      .catch(() => []);
    const tracks = await transformTracks(response.map((track) => track));

    return {
      key: 'profile_top_prisma' + range + '_' + userId,
      tracks,
    };
  };

  const [short, medium, long] = await Promise.all([
    getUserSpotifyTop('short_term'),
    getUserSpotifyTop('medium_term'),
    getUserSpotifyTop('long_term'),
  ]);

  await Promise.all([
    redis.set(short.key, JSON.stringify(short.tracks)),
    redis.set(medium.key, JSON.stringify(medium.tracks)),
    redis.set(long.key, JSON.stringify(long.tracks)),
  ]);
  debugTopQ('completed');
});
