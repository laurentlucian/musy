import { type Transfer, prisma } from "@lib/services/db.server";
import { transferUserLikedToYoutube } from "@lib/services/scheduler/scripts/transfer/liked";
import { singleton } from "@lib/services/singleton.server";
import { log } from "@lib/utils";
import { assign, createActor, setup } from "xstate";
import { fromPromise } from "xstate/actors";

type TransferContext = {
  transfers: Transfer[];
};

type TransferEvents =
  | { type: "START" }
  | { type: "STOP" }
  | { type: "REFRESH" };

export const TRANSFER_MACHINE = setup({
  types: {} as {
    context: TransferContext;
    events: TransferEvents;
  },
  actors: {
    populator: fromPromise(async () => {
      log("populating users", "sync");

      const transfers = await prisma.transfer.findMany({
        where: {
          NOT: {
            state: "COMPLETED",
          },
        },
      });

      return transfers;
    }),
    liked: fromPromise<void, { transfers: Transfer[] }>(async ({ input }) => {
      await Promise.all(
        input.transfers.map((transfer) =>
          transferUserLikedToYoutube({
            userId: transfer.userId,
            skip: transfer.skip,
          }),
        ),
      );
    }),
  },
}).createMachine({
  id: "root",
  initial: "idle",
  context: {
    transfers: [],
  },
  on: {
    REFRESH: {
      target: ".populating",
    },
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
          target: "transfering",
          actions: assign({
            transfers: ({ event }) => event.output,
          }),
        },
      },
    },
    transfering: {
      type: "parallel",
      entry: ({ context }) => {
        log(`transferring ${context.transfers.length} users`, "transfer");
      },
      states: {
        "transfer.liked": {
          initial: "running",
          states: {
            running: {
              invoke: {
                src: "liked",
                input: ({ context }) => ({
                  transfers: context.transfers,
                }),
                onDone: {
                  target: "complete",
                },
              },
            },
            complete: { type: "final" },
          },
        },
      },
      onDone: {
        target: "waiting",
      },
    },
    waiting: {
      entry: () => {
        log("waiting", "transfer");
      },
      after: {
        [24 * 60 * 60 * 1000]: "transfering", // 1 day
      },
    },
  },
});

export function getTransferMachine() {
  return singleton("TRANSFER_MACHINE", () => {
    log("initializing machine", "transfer");
    const actor = createActor(TRANSFER_MACHINE);

    actor.start();
    actor.send({ type: "START" });

    process.on("SIGTERM", () => {
      actor.send({ type: "STOP" });
      actor.stop();
    });

    return actor;
  });
}
