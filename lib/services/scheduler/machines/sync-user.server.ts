import { syncUserLiked } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserPlaylist } from "@lib/services/scheduler/scripts/sync/playlist.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import type SpotifyWebApi from "spotify-web-api-node";
import { assign, fromPromise, setup } from "xstate";

export const SYNC_USER_MACHINE = setup({
  types: {
    context: {} as {
      userId: string;
      spotify: SpotifyWebApi | null;
    },
    input: {} as { userId: string },
  },
  actors: {
    client: fromPromise<SpotifyWebApi, { userId: string }>(
      async ({ input }) => {
        const spotify = await getSpotifyClient({ userId: input.userId });
        log(`spotify client for ${input.userId}`, "sync");
        return spotify;
      },
    ),
    sync: fromPromise<void, { userId: string; spotify: SpotifyWebApi | null }>(
      async ({ input: { spotify, userId } }) => {
        log(`syncing actor for ${userId}`, "sync");
        if (!spotify) return;

        await syncUserProfile({ userId, spotify });
        await syncUserRecent({ userId, spotify });
        await syncUserPlaylist({ userId, spotify });
        await syncUserLiked({ userId, spotify });
        await syncUserTop({ userId, spotify });
      },
    ),
  },
}).createMachine({
  id: "sync-user",
  initial: "client",
  context: ({ input }) => ({
    userId: input.userId,
    spotify: null,
  }),
  entry: ({ context }) => {
    log(`spawned machine for ${context.userId}`, "sync");
  },
  states: {
    client: {
      invoke: {
        src: "client",
        input: ({ context }) => ({
          userId: context.userId,
        }),
        onDone: {
          target: "sync",
          actions: assign({
            spotify: ({ event }) => event.output,
          }),
        },
      },
    },
    sync: {
      entry: ({ context }) => {
        log(`syncing ${context.userId}`, "sync");
      },
      invoke: {
        src: "sync",
        input: ({ context }) => ({
          userId: context.userId,
          spotify: context.spotify,
        }),
        onDone: {
          target: "final",
        },
      },
    },
    final: {
      type: "final",
    },
  },
});
