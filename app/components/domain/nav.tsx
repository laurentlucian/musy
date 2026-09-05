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
import { Image } from "~/components/ui/image";
import { SyncButton } from "~/routes/profile/utils/profile.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Logo } from "~/components/domain/logo";

export function Nav({
  profile,
}: {
  profile: { id: string; name: string | null; image: string | null } | null;
}) {
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
          <p className="section-label mb-2 px-4">Listening</p>
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
          <p className="section-label mb-2 mt-8 px-4">Collection</p>
          <SidebarLink className="nav-item" to="/profile/liked">
            <Heart size={18} />
            Liked songs
          </SidebarLink>
          <SidebarLink className="nav-item" to="/profile/playlists">
            <Library size={18} />
            Playlists
          </SidebarLink>
          <SidebarLink className="nav-item mt-8" to="/queue">
            <ListMusic size={18} />
            Shared queues
          </SidebarLink>
          <div className="mt-auto pt-10">
            {profile && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2">
                <Link
                  to="/profile"
                  className="flex min-w-0 flex-1 items-center gap-2 py-2"
                >
                  <Image
                    src={profile.image ?? ""}
                    name={profile.name}
                    alt=""
                    className="size-7 rounded-full"
                  />
                  <span className="truncate text-xs font-medium">
                    {profile.name || "Profile"}
                  </span>
                </Link>
                <SyncButton userId={profile.id} compact />
              </div>
            )}
            <SidebarLink className="nav-item" to="/settings">
              <Settings size={18} />
              Settings
            </SidebarLink>
          </div>
        </nav>
      </aside>
      <nav className="mobile-nav" aria-label="Main navigation">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="mobile-nav-menu"
            aria-current={journal ? "page" : undefined}
          >
            <ChartNoAxesCombined size={21} />
            Listening
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" sideOffset={12}>
            <DropdownMenuItem asChild>
              <Link to="/profile">Overview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/top">On repeat</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/listened">History</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="mobile-nav-menu"
            aria-current={library ? "page" : undefined}
          >
            <Library size={21} />
            Collection
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" sideOffset={12}>
            <DropdownMenuItem asChild>
              <Link to="/profile/liked">Liked songs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/playlists">Playlists</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <NavLink to="/queue">
          <ListMusic size={21} />
          Together
        </NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="mobile-nav-menu"
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          >
            <Settings size={21} />
            Settings
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" sideOffset={12}>
            {profile && (
              <div className="flex items-center gap-2 border-b p-2">
                <Image
                  src={profile.image ?? ""}
                  name={profile.name}
                  alt=""
                  className="size-7 rounded-full"
                />
                <span className="max-w-32 truncate text-xs">
                  {profile.name || "Profile"}
                </span>
                <SyncButton userId={profile.id} compact />
              </div>
            )}
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
