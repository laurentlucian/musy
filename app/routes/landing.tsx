import { Landing, landingMeta } from "~/components/landing/landing";
import { userContext } from "~/context";
import type { Route } from "./+types/landing";

export const meta = landingMeta;

export function loader({ context }: Route.LoaderArgs) {
  return { signedIn: Boolean(context.get(userContext)) };
}

export default function LandingRoute({ loaderData }: Route.ComponentProps) {
  return <Landing signedIn={loaderData.signedIn} />;
}
