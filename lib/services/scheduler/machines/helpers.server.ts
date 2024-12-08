import { getSyncMachine } from "@lib/services/scheduler/machines/sync.server";
import { getTransferMachine } from "@lib/services/scheduler/machines/transfer.server";
import { isProduction } from "@lib/utils";

export async function initializeMachines() {
  if (!isProduction) return;
  await Promise.all([getSyncMachine(), getTransferMachine()]);
}
