import { getAllUsersId } from "@lib/services/db/users.server";
import { syncUserLiked } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
// import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { singleton } from "@lib/services/singleton.server";
import { log, logError } from "@lib/utils";
import { addMilliseconds, isAfter } from "date-fns";
import { assign, createActor, setup } from "xstate";
import { fromPromise } from "xstate/actors";

const syncs = {
  profile: syncUserProfile,
  recent: syncUserRecent,
  // playlist: syncUserPlaylist,
  liked: syncUserLiked,
  // top: syncUserTop,
};

type SyncKeys = keyof typeof syncs;
export const types = Object.keys(syncs) as SyncKeys[];
export type SyncTypes = typeof types;
export type SyncType = SyncTypes[number];

const SYNC_INTERVALS = {
  recent: 60 * 5000, // 5 minute
  liked: 10 * 60 * 1000, // 10 minutes
  // top: 24 * 60 * 60 * 1000, // 1 day
  profile: 24 * 60 * 60 * 1000, // 1 day
} as const;

type SyncerContext = {
  lastSync: Map<SyncType, Date>;
};

const isDue = (type: SyncType, lastSync: Map<SyncType, Date>) => {
  const last = lastSync.get(type) ?? new Date(0);
  const now = new Date();
  const nextDueDate = addMilliseconds(last, SYNC_INTERVALS[type]);
  return isAfter(now, nextDueDate);
};

export const SYNC_MACHINE = setup({
  types: {} as {
    context: SyncerContext;
  },
  actors: {
    sync: fromPromise(
      async ({ input: { lastSync } }: { input: SyncerContext }) => {
        const users = await getAllUsersId();
        log(`syncing ${users.length} users`, "sync");

        const typesToSync = types.filter((type) => isDue(type, lastSync));
        log(`${typesToSync.length} types due`, "sync");

        for (const type of typesToSync) {
          log(`syncing ${type}`, "sync");
          for (const [i, userId] of users.entries()) {
            log(`${i + 1} / ${users.length} users synced`, "sync");
            const spotify = await getSpotifyClient({ userId });
            await syncs[type]({ userId, spotify });
          }
          lastSync.set(type, new Date());
          log(`synced ${type}`, "sync");
        }

        log("sync complete", "sync");
        return lastSync;
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
                lastSync: ({ event }) => event.output,
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

    process.on("SIGTERM", () => {
      actor.stop();
    });

    return actor;
  });
}
