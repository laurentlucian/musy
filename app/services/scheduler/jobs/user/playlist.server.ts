import invariant from 'tiny-invariant';

import { notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { debugPlaylistQ } from '../user.server';

export const playlistQ = Queue<{ userId: string }>('update_playlist', async (job) => {
  const { userId } = job.data;
  debugPlaylistQ('starting...', userId);
  const { spotify } = await getSpotifyClient(userId);
  invariant(spotify, 'Spotify client not found');

  const response = await spotify.getUserPlaylists(userId, {
    limit: 50,
  });

  const playlists = response.body.items.filter((p) => p.owner.id === userId);
  const saved = await prisma.playlist.findMany({
    select: {
      id: true,
      total: true,
    },
    where: {
      id: {
        in: playlists.map((p) => p.id),
      },
    },
  });

  debugPlaylistQ(
    'playlists',
    playlists.map((p) => p.name),
  );

  const onlyPlaylistsNeededToUpdate = playlists.filter((p) => {
    const savedPlaylist = saved.find((s) => s.id === p.id);
    return !savedPlaylist || savedPlaylist.total < p.tracks.total;
  });
  const playlistsTracks = await Promise.all(
    onlyPlaylistsNeededToUpdate.map((p) => spotify.getPlaylistTracks(p.id)),
  );
  debugPlaylistQ(
    'playlistTracks',
    playlistsTracks.map((p) => p.body.items.length),
  );

  for (const [index, playlist] of onlyPlaylistsNeededToUpdate.entries()) {
    await prisma.playlist.upsert({
      create: {
        description: playlist.description,
        id: playlist.id,
        image: playlist.images[0].url,
        name: playlist.name,
        total: playlist.tracks.total,
        uri: playlist.uri,
        user: {
          connect: {
            userId: userId,
          },
        },
      },
      update: {
        description: playlist.description,
        image: playlist.images[0].url,
        name: playlist.name,
        total: playlist.tracks.total,
        uri: playlist.uri,
        user: {
          connect: {
            userId: userId,
          },
        },
      },
      where: { id: playlist.id },
    });
    debugPlaylistQ('playlist - added playlist', playlist.name);

    const tracks = playlistsTracks[index];

    const trackModels = tracks.body.items
      .map(
        (t) =>
          t.track && {
            addedAt: t.added_at,
            track: createTrackModel(t.track),
          },
      )
      .filter(notNull);

    debugPlaylistQ('playlist - adding tracks', tracks.body.items.length);
    try {
      for (const { addedAt, track } of trackModels) {
        await prisma.track.upsert({
          create: track,
          update: track,
          where: { id: track.id },
        });
        await prisma.playlistTrack.upsert({
          create: {
            addedAt: addedAt,
            playlistId: playlist.id,
            trackId: track.id,
          },
          update: {
            playlistId: playlist.id,
            trackId: track.id,
          },
          where: {
            playlistId_trackId: {
              playlistId: playlist.id,
              trackId: track.id,
            },
          },
        });
      }
      debugPlaylistQ('playlist - added tracks');
    } catch (e) {
      debugPlaylistQ('playlist - error adding tracks', e);
    }
  }
});
