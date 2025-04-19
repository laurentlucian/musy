import { singleton } from "@lib/services/singleton.server";
import { log } from "@lib/utils";
import { createActor } from "xstate";
import { OnboardingCoordinatorMachine } from "./coordinator.server";

export const getOnboardingCoordinator = () =>
  singleton("ONBOARDING_COORDINATOR", () => {
    log("initializing onboarding coordinator", "onboarding-coordinator");
    const actor = createActor(OnboardingCoordinatorMachine);
    actor.start();

    process.on("SIGTERM", () => {
      log("stopping onboarding coordinator", "onboarding-coordinator");
      actor.send({ type: "STOP_COORDINATOR" });
    });

    return actor;
  });

export * from "./types";
export * from "./sync.server";
export * from "./coordinator.server";
