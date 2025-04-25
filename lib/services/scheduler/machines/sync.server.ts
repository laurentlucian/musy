import { env } from "@lib/env.server";
import { prisma } from "@lib/services/db.server";
import { getAllUsersId } from "@lib/services/db/users.server";
import { SYNC_USER_MACHINE } from "@lib/services/scheduler/machines/sync-user.server";
import { singleton } from "@lib/services/singleton.server";
import { log, logError } from "@lib/utils";
import { assign, createActor, setup } from "xstate";
import { fromPromise } from "xstate/actors";

type SyncerContext = {
  users: string[];
  current: string | null;
};

type SyncerEvents =
  | { type: "START" }
  | { type: "STOP" }
  | { type: "WAIT" }
  | { type: "DONE" };

const isProduction = env.NODE_ENV === "production";

export const SYNC_MACHINE = setup({
  types: {} as {
    context: SyncerContext;
    events: SyncerEvents;
  },
  actors: {
    populator: fromPromise(async () => {
      log("populating users", "sync");
      const users = await getAllUsersId();

      if (users.length === 0) {
        log("no users found", "sync");
        throw new Error("no users found");
      }

      const latestSyncs = await prisma.sync.groupBy({
        by: ["userId"],
        _max: {
          updatedAt: true,
        },
      });

      const syncMap = new Map(
        latestSyncs.map(
          (sync: { userId: string; _max: { updatedAt: Date | null } }) => [
            sync.userId,
            sync._max.updatedAt,
          ],
        ),
      );

      return users.slice(0, !isProduction ? 1 : undefined).sort((a, b) => {
        const aSync = syncMap.get(a);
        const bSync = syncMap.get(b);

        if (!aSync) return -1;
        if (!bSync) return 1;

        return aSync.getTime() - bSync.getTime();
      });
    }),
  },
  delays: {
    RETRY_DELAY: 5 * 60 * 1000, // 1 minute (in milliseconds)
    CYCLE_INTERVAL: 5 * 60 * 1000, // 5 minutes (in milliseconds)
  },
}).createMachine({
  id: "root",
  initial: "idle",
  context: {
    users: [],
    current: null,
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
          actions: [
            assign({
              current: ({ context }) => context.users[0],
              users: ({ context }) => context.users.slice(1),
            }),
          ],
          target: "syncing",
        },
      ],
    },

    syncing: {
      entry: ({ context }) => {
        const remaining = context.users.length;
        log(`syncing ${context.current} (${remaining} remaining)`, "sync");
      },
      invoke: {
        src: SYNC_USER_MACHINE,
        input: ({ context }) => ({
          userId: context.current as string,
        }),
        onDone: {
          target: "waiting",
          actions: assign(() => {
            log("syncing done", "sync");
            return {
              current: null,
            };
          }),
        },
      },
    },
    waiting: {
      entry: () => {
        log("waiting", "sync");
      },
      after: {
        CYCLE_INTERVAL: "processing",
      },
    },
    failure: {
      entry: () => {
        log("failure", "sync");
      },
      after: {
        RETRY_DELAY: "populating",
      },
    },
  },
});

export function getSyncMachine() {
  return singleton("SYNC_MACHINE", () => {
    log("initializing", "sync");
    const actor = createActor(SYNC_MACHINE);

    actor.start();
    actor.send({ type: "START" });

    process.on("SIGTERM", () => {
      actor.send({ type: "STOP" });
      actor.stop();
    });

    return actor;
  });
}
