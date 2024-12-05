import { getAllUsersId } from "@lib/services/prisma/users.server";
import { syncUserLiked } from "@lib/services/scheduler/scripts/user/liked.server";
import { syncPlaybacks } from "@lib/services/scheduler/scripts/user/playback.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/user/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/user/recent.server";
import { singleton } from "@lib/services/singleton.server";
import { log, logError } from "@lib/utils";
import { assign, createActor, setup } from "xstate";
import { fromPromise } from "xstate/actors";

type CronerContext = {
  users: string[];
  current: string | null;
  tasks: Map<`${string}:${string}`, Date>;
};

type CronerEvents = { type: "START" } | { type: "STOP" };

const RECENT_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PROFILE_SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 1 day
const LIKED_SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour

export const CRONER_MACHINE = setup({
  types: {} as {
    context: CronerContext;
    events: CronerEvents;
  },
  actors: {
    populator: fromPromise(() => {
      log("populating users", "croner");
      return getAllUsersId();
    }),
    recent: fromPromise<Date | null, { userId: string; lastRunAt?: Date }>(
      async ({ input: { lastRunAt, userId } }) => {
        if (
          lastRunAt &&
          Date.now() - lastRunAt.getTime() < RECENT_SYNC_INTERVAL
        )
          return lastRunAt;

        await syncUserRecent(userId).catch(logError);
        return new Date();
      },
    ),
    profile: fromPromise<Date | null, { userId: string; lastRunAt?: Date }>(
      async ({ input: { lastRunAt, userId } }) => {
        if (
          lastRunAt &&
          Date.now() - lastRunAt.getTime() < PROFILE_SYNC_INTERVAL
        )
          return lastRunAt;

        await syncUserProfile(userId).catch(logError);
        return new Date();
      },
    ),
    liked: fromPromise<Date | null, { userId: string; lastRunAt?: Date }>(
      async ({ input: { lastRunAt, userId } }) => {
        if (lastRunAt && Date.now() - lastRunAt.getTime() < LIKED_SYNC_INTERVAL)
          return lastRunAt;

        await syncUserLiked(userId).catch(logError);
        return new Date();
      },
    ),
    playback: fromPromise<Date | null>(async () => {
      await syncPlaybacks().catch(logError);
      return new Date();
    }),
  },
  delays: {
    RETRY_DELAY: 5000, // 5 seconds (in milliseconds)
    CYCLE_INTERVAL: 1 * 60 * 1000, // 1 minute (in milliseconds)
  },
}).createMachine({
  id: "root",
  initial: "idle",
  context: {
    users: [],
    current: null,
    tasks: new Map(),
  },
  states: {
    idle: {
      on: {
        START: "populating",
      },
    },
    populating: {
      invoke: {
        src: "populator",
        onDone: {
          target: "processing",
          actions: assign({
            users: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "failure",
          actions: () => {
            logError("populator failed");
          },
        },
      },
    },
    processing: {
      always: [
        {
          guard: ({ context }) => context.users.length === 0,
          target: "populating",
        },
        {
          actions: assign({
            current: ({ context }) => context.users[0],
            users: ({ context }) => context.users.slice(1),
          }),
          target: "syncing",
        },
      ],
    },
    syncing: {
      type: "parallel",
      entry: ({ context }) => {
        log(`syncing ${context.current}`, "croner");
      },
      invoke: [
        {
          src: "recent",
          input: ({ context }) => ({
            userId: context.current as string,
            lastRunAt: context.tasks.get(`recent:${context.current}`),
          }),
          onDone: {
            actions: assign({
              tasks: ({ context, event }) => {
                if (!event.output) return context.tasks;

                const tasks = new Map(context.tasks);
                tasks.set(`recent:${context.current}`, event.output);
                return tasks;
              },
            }),
          },
        },
        {
          src: "profile",
          input: ({ context }) => ({
            userId: context.current as string,
            lastRunAt: context.tasks.get(`profile:${context.current}`),
          }),
          onDone: {
            actions: assign({
              tasks: ({ context, event }) => {
                if (!event.output) return context.tasks;

                const tasks = new Map(context.tasks);
                tasks.set(`profile:${context.current}`, event.output);
                return tasks;
              },
            }),
          },
        },
        {
          src: "liked",
          input: ({ context }) => ({
            userId: context.current as string,
            lastRunAt: context.tasks.get(`liked:${context.current}`),
          }),
          onDone: {
            actions: assign({
              tasks: ({ context, event }) => {
                if (!event.output) return context.tasks;

                const tasks = new Map(context.tasks);
                tasks.set(`liked:${context.current}`, event.output);
                return tasks;
              },
            }),
          },
        },
        {
          src: "playback",
          input: ({ context }) => ({
            userId: context.current as string,
          }),
        },
      ],
      onDone: {
        target: "waiting",
        actions: assign({
          current: null,
        }),
      },
    },
    waiting: {
      after: {
        CYCLE_INTERVAL: "processing",
      },
    },
    failure: {
      after: {
        RETRY_DELAY: "populating",
      },
    },
  },
});

export function initializeCronerMachine() {
  return singleton("CRONER_MACHINE", () => {
    log("initializing machine", "croner");
    const actor = createActor(CRONER_MACHINE);

    actor.start();
    actor.send({ type: "START" });

    process.on("SIGTERM", () => {
      actor.send({ type: "STOP" });
      actor.stop();
    });

    return actor;
  });
}
