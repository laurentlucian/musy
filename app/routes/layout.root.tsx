import { userContext } from "~/context";
import { getProfile } from "~/lib.server/services/db/users";
import type { Route } from "./+types/layout.root";
import { Outlet } from "react-router";
import { Nav } from "~/components/domain/nav";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  const profile = userId ? await getProfile(userId) : null;
  return {
    profile: profile
      ? { id: profile.id, name: profile.name, image: profile.image }
      : null,
  };
}

export default function LayoutRoot({ loaderData }: Route.ComponentProps) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav profile={loaderData.profile} />
      <div className="app-content">
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
