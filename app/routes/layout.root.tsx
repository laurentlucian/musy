import { userContext } from "~/context";
import { getProfile } from "~/lib.server/services/db/users";
import type { Route } from "./+types/layout.root";
import { Outlet, useNavigation } from "react-router";
import { Nav } from "~/components/domain/nav";
import { Logo } from "~/components/domain/logo";

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
  const navigation = useNavigation();
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav profile={loaderData.profile} />
      <div className="app-content">
        <header className="app-masthead">
          <div className="md:hidden">
            <Logo />
          </div>
          <output className="section-label">
            {navigation.state === "loading" ? "Loading…" : ""}
          </output>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
