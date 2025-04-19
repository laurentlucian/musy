import { log, logError } from "@lib/utils";
import { assign, fromPromise, sendParent, setup } from "xstate";

import { syncUserLikedPage } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import type {
  OnboardingContext,
  OnboardingError,
  OnboardingEvents,
} from "./types";

const syncUserLikedPageActor = fromPromise(
  async ({ input }: { input: { userId: string; offset: number } }) => {
    log("syncing liked page", "onboarding-sync");
    const result = await syncUserLikedPage(input.userId, input.offset);
    log("synced liked page", "onboarding-sync");
    return result;
  },
);

const syncUserProfileActor = fromPromise(
  async ({ input }: { input: { userId: string } }) => {
    log("syncing user profile", "onboarding-sync");
    const result = await syncUserProfile(input.userId);
    log("synced user profile", "onboarding-sync");
    return result;
  },
);

const syncTopTracksActor = fromPromise(
  async ({ input }: { input: { userId: string } }) => {
    log("syncing top tracks", "onboarding-sync");
    const result = await syncUserTop(input.userId);
    log("synced top tracks", "onboarding-sync");
    return result;
  },
);

const syncRecentTracksActor = fromPromise(
  async ({ input }: { input: { userId: string } }) => {
    log("syncing recent tracks", "onboarding-sync");
    const result = await syncUserRecent(input.userId);
    log("synced recent tracks", "onboarding-sync");
    return result;
  },
);

export const OnboardingSyncMachine = setup({
  types: {
    context: {} as OnboardingContext,
    events: {} as OnboardingEvents,
    input: {} as { userId: string },
  },
  actors: {
    syncUserProfile: syncUserProfileActor,
    syncUserTop: syncTopTracksActor,
    syncUserRecent: syncRecentTracksActor,
    syncUserLikedPage: syncUserLikedPageActor,
  },
}).createMachine({
  id: "onboarding-sync",
  initial: "idle",
  context: ({ input }) => ({
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
        src: "syncUserProfile",
        input: ({ context }) => ({ userId: context.userId }),
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
        src: "syncUserTop",
        input: ({ context }) => ({ userId: context.userId }),
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
        src: "syncUserRecent",
        input: ({ context }) => ({ userId: context.userId }),
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
        src: "syncUserLikedPage",
        input: ({ context }) => ({
          userId: context.userId,
          offset: context.liked.offset,
        }),
        onDone: {
          target: "success",
          actions: assign({
            liked: ({ event }) => ({
              offset: event.output.nextOffset,
              total: event.output.total,
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
