import { getAllUsersId } from "@lib/services/db/users.server";
import { syncUserLiked } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { singleton } from "@lib/services/singleton.server";
import { log, logError } from "@lib/utils";
import { addMilliseconds, isAfter } from "date-fns";
import { assign, createActor, setup } from "xstate";
import { fromPromise } from "xstate/actors";

const SYNC_TYPES = ["profile", "recent", "liked", "top"] as const;
type SyncType = (typeof SYNC_TYPES)[number];

const SYNC_INTERVALS = {
  recent: 60 * 5000, // 5 minute
  liked: 10 * 60 * 1000, // 10 minutes
  top: 24 * 60 * 60 * 1000, // 1 day
  profile: 24 * 60 * 60 * 1000, // 1 day
} as const;

type SyncerContext = {
  lastSync: Map<SyncType, Date>;
  currentType?: SyncType;
};

function getSyncFunction(type: SyncType) {
  switch (type) {
    case "profile":
      return syncUserProfile;
    case "recent":
      return syncUserRecent;
    case "liked":
      return syncUserLiked;
    case "top":
      return syncUserTop;
  }
}

const isDue = (type: SyncType, lastSync: Map<SyncType, Date>) => {
  const last = lastSync.get(type) ?? new Date(0);
  const now = new Date();
  const nextDueDate = addMilliseconds(last, SYNC_INTERVALS[type]);
  return isAfter(now, nextDueDate);
};

const getNextSyncType = (
  lastSync: Map<SyncType, Date>,
  currentType?: SyncType,
) => {
  const dueTypes = SYNC_TYPES.filter((type) => isDue(type, lastSync));
  if (!dueTypes.length) return;

  if (!currentType) return dueTypes[0];

  const nextIndex = (dueTypes.indexOf(currentType) + 1) % dueTypes.length;
  return dueTypes[nextIndex];
};

export const SYNC_MACHINE = setup({
  types: {} as {
    context: SyncerContext;
  },
  actors: {
    sync: fromPromise(
      async ({
        input: { lastSync, currentType },
      }: {
        input: SyncerContext;
      }) => {
        const users = await getAllUsersId();
        log(`syncing ${users.length} users`, "sync");

        const typeToSync = currentType ?? getNextSyncType(lastSync);
        if (!typeToSync) {
          log("no types due", "sync");
          return { lastSync: new Map(lastSync), currentType: undefined };
        }

        log(`syncing ${typeToSync}`, "sync");
        const syncFn = getSyncFunction(typeToSync);
        for (const userId of users) {
          const spotify = await getSpotifyClient({ userId });
          await syncFn({ userId, spotify });
        }

        const newLastSync = new Map(lastSync);
        newLastSync.set(typeToSync, new Date());
        log(`synced ${typeToSync}`, "sync");

        const nextType = getNextSyncType(newLastSync, typeToSync);
        log(nextType ? `next type: ${nextType}` : "all types synced", "sync");

        return { lastSync: newLastSync, currentType: nextType };
      },
    ),
  },
}).createMachine({
  id: "root",
  initial: "running",
  context: {
    lastSync: new Map(),
  },
  states: {
    running: {
      initial: "syncing",
      states: {
        syncing: {
          invoke: {
            src: "sync",
            input: ({ context }) => context,
            onDone: {
              actions: assign({
                lastSync: ({ event }) => event.output.lastSync,
                currentType: ({ event }) => event.output.currentType,
              }),
              target: "waiting",
            },
            onError: {
              actions: () => logError("sync failed"),
              target: "waiting",
            },
          },
        },
        waiting: {
          after: {
            "60000": "syncing", // check every minute
          },
        },
      },
    },
  },
});

export function getSyncMachine() {
  return singleton("SYNC_MACHINE", () => {
    log("initializing", "sync");
    const actor = createActor(SYNC_MACHINE);
    actor.start();

    const cleanup = () => {
      actor.stop();
      process.removeListener("SIGTERM", cleanup);
    };

    process.once("SIGTERM", cleanup);

    return actor;
  });
}
