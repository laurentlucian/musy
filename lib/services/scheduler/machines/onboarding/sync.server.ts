import { syncUserLikedPage } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import { log } from "@lib/utils";
import type SpotifyWebApi from "spotify-web-api-node";
import { assign, fromPromise, sendParent, setup } from "xstate";

export type OnboardingContext = {
  spotify: SpotifyWebApi | null;
  userId: string;
  progress: number;
  liked: {
    offset: number;
    total: number;
  };
  error: string | null;
};

export type OnboardingEvents =
  | { type: "START"; userId: string }
  | { type: "RETRY" }
  | { type: "CANCEL" };

export type OnboardingError = {
  type: "error.platform";
  message: string;
};

type SyncArgs = {
  userId: string;
  type: string;
  spotify: SpotifyWebApi | null;
  offset: number;
};

const syncActor = fromPromise(
  async ({
    input,
  }: {
    input: SyncArgs;
  }) => {
    const { userId, type, spotify, offset } = input;
    if (!spotify) throw new Error("No Spotify client provided");

    switch (type) {
      case "profile":
        return syncUserProfile({ userId, spotify });
      case "recent":
        return syncUserRecent({ userId, spotify });
      case "top":
        return syncUserTop({ userId, spotify });
      case "liked":
        return syncUserLikedPage({ userId, offset, spotify });
    }
  },
);

export const OnboardingSyncMachine = setup({
  types: {
    context: {} as OnboardingContext,
    events: {} as OnboardingEvents,
    input: {} as { userId: string },
  },
  actors: {
    syncActor,
  },
}).createMachine({
  id: "onboarding-sync",
  initial: "idle",
  context: ({ input }) => ({
    spotify: null,
    userId: input.userId,
    progress: 0,
    error: null,
    liked: {
      offset: 0,
      total: 0,
    },
  }),
  states: {
    idle: {
      entry: () => log("starting onboarding sync", "onboarding-sync"),
      always: {
        target: "sync_profile",
        guard: ({ context }) => context.progress === 0,
      },
    },
    sync_profile: {
      entry: assign(() => ({
        progress: 10,
      })),
      invoke: {
        src: "syncActor",
        input: ({ context }) => ({
          userId: context.userId,
          type: "profile",
          spotify: context.spotify,
          offset: 0,
        }),
        onDone: {
          target: "sync_top",
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) => (event.error as OnboardingError).message,
          }),
        },
      },
      exit: assign(() => ({
        progress: 20,
      })),
    },
    sync_top: {
      entry: assign(() => ({
        progress: 30,
      })),
      invoke: {
        src: "syncActor",
        input: ({ context }) => ({
          userId: context.userId,
          type: "top",
          spotify: context.spotify,
          offset: 0,
        }),
        onDone: {
          target: "sync_recent",
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) => (event.error as OnboardingError).message,
          }),
        },
      },
      exit: assign(() => ({
        progress: 40,
      })),
    },
    sync_recent: {
      entry: assign(() => ({
        progress: 50,
      })),
      invoke: {
        src: "syncActor",
        input: ({ context }) => ({
          userId: context.userId,
          type: "recent",
          spotify: context.spotify,
          offset: 0,
        }),
        onDone: {
          target: "sync_liked",
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) => (event.error as OnboardingError).message,
          }),
        },
      },
      exit: assign(() => ({
        progress: 60,
      })),
    },
    sync_liked: {
      entry: assign(() => ({
        progress: 70,
      })),
      invoke: {
        src: "syncActor",
        input: ({ context }) => ({
          userId: context.userId,
          type: "liked",
          spotify: context.spotify,
          offset: context.liked.offset,
        }),
        onDone: {
          target: "success",
          actions: assign({
            liked: ({ event }) => ({
              offset: event.output?.nextOffset ?? 0,
              total: event.output?.total ?? 0,
            }),
            progress: ({ context }) =>
              Math.min(
                95,
                Math.max(
                  70,
                  (context.liked.offset / context.liked.total) * 100,
                ),
              ),
          }),
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) => (event.error as OnboardingError).message,
          }),
        },
      },
      exit: assign(() => ({
        progress: 100,
      })),
    },
    error: {
      entry: sendParent(({ context }) => ({
        type: "ONBOARDING_FAILED",
        userId: context.userId,
      })),
      on: {
        RETRY: {
          target: "sync_profile",
        },
        CANCEL: {
          target: "idle",
        },
      },
    },
    success: {
      type: "final",
      entry: sendParent(({ context }) => ({
        type: "ONBOARDING_COMPLETE",
        userId: context.userId,
      })),
    },
  },
});
