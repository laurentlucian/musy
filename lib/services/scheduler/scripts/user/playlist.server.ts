import { prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import invariant from "tiny-invariant";

const notNull = <T>(val: T | null): val is T => {
  return val !== null;
};

export async function syncUserPlaylist(userId: string) {
  try {
    log("starting...", "playlist");
    const spotify = await SpotifyService.createFromUserId(userId);
    const client = spotify.getClient();
    invariant(client, "spotify client not found");

    const response = await client.getUserPlaylists(userId, {
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

    log(`playlists: ${playlists.length}`, "playlist");

    const onlyPlaylistsNeededToUpdate = playlists.filter((p) => {
      const savedPlaylist = saved.find((s) => s.id === p.id);
      return !savedPlaylist || savedPlaylist.total < p.tracks.total;
    });

    const playlistsTracks = await Promise.all(
      onlyPlaylistsNeededToUpdate.map((p) => client.getPlaylistTracks(p.id)),
    );

    log(
      `playlistTracks: ${playlistsTracks
        .map((p) => p.body.items.length)
        .join(", ")}`,
      "playlist",
    );

    for (const [index, playlist] of onlyPlaylistsNeededToUpdate.entries()) {
      await prisma.playlist.upsert({
        create: {
          id: playlist.id,
          image: playlist.images[0].url,
          name: playlist.name,
          total: playlist.tracks.total,
          uri: playlist.uri,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        update: {
          image: playlist.images[0].url,
          name: playlist.name,
          total: playlist.tracks.total,
          uri: playlist.uri,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        where: { id: playlist.id },
      });
      log("playlist - added playlist", playlist.name);

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

      log(`playlist - adding tracks: ${tracks.body.items.length}`, "playlist");
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
        log("playlist - added tracks", "playlist");
      } catch (e) {
        log("playlist - error adding tracks", "playlist");
      }
    }

    log("completed", "playlist");
  } catch {
    log("failure", "playlist");
  }
}
