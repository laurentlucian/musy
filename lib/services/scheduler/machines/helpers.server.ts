import { getSyncMachine } from "@lib/services/scheduler/machines/sync.server";
import { getTransferMachine } from "@lib/services/scheduler/machines/transfer.server";

export async function initializeMachines() {
  await Promise.all([getSyncMachine(), getTransferMachine()]);
}
