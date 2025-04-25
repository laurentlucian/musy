import { OnboardingSyncMachine } from "@lib/services/scheduler/machines/onboarding/sync.server";
import { log, logError } from "@lib/utils";
import { assign, setup } from "xstate";
import type { CoordinatorContext, CoordinatorEvents } from "./types";

export const OnboardingCoordinatorMachine = setup({
  types: {} as {
    context: CoordinatorContext;
    events: CoordinatorEvents;
  },
  actions: {
    spawnOnboarding: assign({
      onboardings: ({ context, event, spawn }) => {
        const { userId } = event as {
          type: "START_ONBOARDING";
          userId: string;
        };

        if (context.onboardings.has(userId)) {
          log(
            `onboarding already active for ${userId}`,
            "onboarding-coordinator",
          );
          return context.onboardings;
        }

        log(
          `spawning initial onboarding for ${userId}`,
          "onboarding-coordinator",
        );

        const machine = spawn(OnboardingSyncMachine, {
          input: { userId },
          systemId: `onboarding-${userId}`,
        });

        log(`onboarding ${userId} spawned`, "onboarding-coordinator");

        return new Map(context.onboardings).set(userId, machine);
      },
    }),
    cleanupActor: assign({
      onboardings: ({ context, event }) => {
        const { userId } = event as { userId: string };
        const newMap = new Map(context.onboardings);
        newMap.delete(userId);
        log(`onboarding ${userId} cleaned up`, "onboarding-coordinator");
        return newMap;
      },
    }),
    cancelOnboarding: ({ context, event }) => {
      const { userId } = event as { type: "CANCEL_ONBOARDING"; userId: string };
      const actor = context.onboardings.get(userId);

      if (actor) {
        log(`cancelling onboarding for ${userId}`, "onboarding-coordinator");
        actor.send({ type: "CANCEL" });
      }
    },
    logOutcome: ({ event }) => {
      const { type, userId, error } = event as {
        type: string;
        userId: string;
        error?: any;
      };

      if (type === "ONBOARDING_COMPLETE") {
        log(`onboarding completed for ${userId}`, "onboarding-coordinator");
      } else if (type === "ONBOARDING_FAILED") {
        logError(`onboarding failed for ${userId}: ${error}`);
      } else if (type === "ONBOARDING_CANCELLED") {
        log(`onboarding cancelled for ${userId}`, "onboarding-coordinator");
      }
    },
    stopAllChildren: ({ context }) => {
      log("stopping all onboarding actors", "onboarding-coordinator");
      context.onboardings.forEach((actor, userId) => {
        log(`cancelling onboarding for ${userId}`, "onboarding-coordinator");
        actor.send({ type: "CANCEL" });
      });
    },
  },
}).createMachine({
  id: "onboardingCoordinator",
  context: {
    onboardings: new Map(),
  },
  initial: "active",
  on: {
    START_ONBOARDING: {
      actions: "spawnOnboarding",
    },
    CANCEL_ONBOARDING: {
      actions: "cancelOnboarding",
    },
    ONBOARDING_COMPLETE: {
      actions: ["logOutcome", "cleanupActor"],
    },
    ONBOARDING_FAILED: {
      actions: ["logOutcome", "cleanupActor"],
    },
    ONBOARDING_CANCELLED: {
      actions: ["logOutcome", "cleanupActor"],
    },
    STOP_COORDINATOR: {
      actions: "stopAllChildren",
      target: ".stopped",
    },
  },
  states: {
    active: {},
    stopped: {
      type: "final",
      entry: () =>
        log("onboarding coordinator stopped", "onboarding-coordinator"),
    },
  },
});
