import type { ActorRefFrom } from "xstate";
import type { OnboardingSyncMachine } from "./sync.server";

export type LikedPageResult = {
  nextOffset: number | null;
  total: number;
  success: boolean;
};

export type OnboardingContext = {
  userId: string;
  progress: number;
  liked: {
    offset: number;
    total: number;
  };
  error: string | null;
};

export type OnboardingEvents =
  | { type: "START"; userId: string }
  | { type: "RETRY" }
  | { type: "CANCEL" };

export type CoordinatorContext = {
  onboardings: Map<string, ActorRefFrom<typeof OnboardingSyncMachine>>;
};

export type CoordinatorEvents =
  | { type: "START_ONBOARDING"; userId: string }
  | { type: "CANCEL_ONBOARDING"; userId: string }
  | { type: "GET_STATUS"; userId: string }
  | { type: "STOP_COORDINATOR" }
  | { type: "ONBOARDING_COMPLETE"; userId: string }
  | { type: "ONBOARDING_FAILED"; userId: string; error: OnboardingError }
  | { type: "ONBOARDING_CANCELLED"; userId: string };

export type OnboardingError = {
  type: "error.platform";
  message: string;
};
