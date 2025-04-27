import { getSyncMachine } from "@lib/services/scheduler/machines/sync.server";

export async function initializeMachines() {
  await Promise.all([getSyncMachine()]);
}
