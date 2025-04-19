import { getOnboardingCoordinator } from "@lib/services/scheduler/machines/onboarding";
import type { Route } from "./+types/onboarding";

export async function loader({ context: { userId } }: Route.LoaderArgs) {
  try {
    if (!userId) return null;
    const coordinator = getOnboardingCoordinator().getSnapshot().context;

    const onboarding = coordinator.onboardings.get(userId);
    if (onboarding) {
      const snapshot = onboarding.getSnapshot();
      const progress = snapshot.context.progress;
      return progress;
    }

    return null;
  } catch (error) {
    console.error("onboarding/loader/error", error);
    return null;
  }
}
