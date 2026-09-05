import {
  ChartNoAxesCombined,
  Heart,
  History,
  Library,
  ListMusic,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Link, NavLink, useLocation, type To } from "react-router";
import { Logo } from "~/components/domain/logo";

export function Nav() {
  const { pathname } = useLocation();
  const library = /\/(liked|playlists)(\/|$)/.test(pathname);
  const journal = pathname.startsWith("/profile") && !library;
  return (
    <>
      <aside className="app-sidebar">
        <div className="px-4">
          <Logo />
        </div>
        <nav
          aria-label="Main navigation"
          className="mt-14 flex flex-1 flex-col gap-1"
        >
          <p className="section-label mb-2 px-4">Your listening</p>
          <SidebarLink className="nav-item" to="/profile" end>
            <ChartNoAxesCombined size={18} />
            Overview
          </SidebarLink>
          <SidebarLink className="nav-item" to="/profile/top">
            <TrendingUp size={18} />
            On repeat
          </SidebarLink>
          <SidebarLink className="nav-item" to="/profile/listened">
            <History size={18} />
            History
          </SidebarLink>
          <p className="section-label mb-2 mt-8 px-4">Your collection</p>
          <SidebarLink className="nav-item" to="/profile/liked">
            <Heart size={18} />
            Liked songs
          </SidebarLink>
          <SidebarLink className="nav-item" to="/profile/playlists">
            <Library size={18} />
            Playlists
          </SidebarLink>
          <p className="section-label mb-2 mt-8 px-4">Together</p>
          <SidebarLink className="nav-item" to="/queue">
            <ListMusic size={18} />
            Shared queues
          </SidebarLink>
          <div className="mt-auto pt-10">
            <SidebarLink className="nav-item" to="/settings">
              <Settings size={18} />
              Settings
            </SidebarLink>
          </div>
        </nav>
      </aside>
      <nav className="mobile-nav" aria-label="Main navigation">
        <Link to="/profile" aria-current={journal ? "page" : undefined}>
          <ChartNoAxesCombined size={21} />
          Listening
        </Link>
        <Link to="/profile/liked" aria-current={library ? "page" : undefined}>
          <Library size={21} />
          Collection
        </Link>
        <NavLink to="/queue">
          <ListMusic size={21} />
          Together
        </NavLink>
        <NavLink to="/settings">
          <Settings size={21} />
          Settings
        </NavLink>
      </nav>
    </>
  );
}

export function NavLinkSub({
  to,
  children,
  icon,
}: {
  to: To;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <NavLink to={to} end className="flex items-center gap-2">
      {icon}
      {children}
    </NavLink>
  );
}

function SidebarLink({
  to,
  end,
  children,
  className,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
  className: string;
}) {
  const { pathname } = useLocation();
  const normalized = pathname.replace(
    /^\/profile\/(?!top(?:\/|$)|liked(?:\/|$)|listened(?:\/|$)|playlists(?:\/|$))[^/]+/,
    "/profile",
  );
  const active = end
    ? normalized === to
    : normalized === to || normalized.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
