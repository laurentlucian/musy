import { Outlet, useLocation, useNavigation } from "react-router";
import { Nav } from "~/components/domain/nav";
import { Logo } from "~/components/domain/logo";

export default function LayoutRoot() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const section = pathname.startsWith("/queue")
    ? "Together"
    : pathname.startsWith("/settings")
      ? "Your account"
      : /\/(track|artist|album)\//.test(pathname)
        ? "Music details"
        : /\/(liked|playlists)(\/|$)/.test(pathname)
          ? "Your collection"
          : "Your listening";
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <div className="app-content">
        <header className="app-masthead">
          <div className="md:hidden">
            <Logo />
          </div>
          <p className="section-label hidden md:block">Musy / {section}</p>
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
