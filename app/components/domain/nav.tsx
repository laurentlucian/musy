import { pwa } from "@lib/utils";
import { ChevronRight } from "lucide-react";
import { NavLink as RouterNavLink, type To } from "react-router";
import { Logo } from "~/components/domain/logo";
import { Button } from "~/components/ui/button";

export function Nav() {
  return (
    <nav
      className="sm:justify-start! fixed bottom-0 flex w-full justify-center gap-y-3 bg-[#101010] p-2 py-4 data-[pwa=true]:pb-8! sm:top-0 sm:left-0 sm:w-fit! sm:flex-col"
      data-pwa={pwa}
    >
      <Logo />
      <NavLink to="/">create</NavLink>
      <NavLink to="/playlists">playlists</NavLink>
      <NavLink to="/profile">profile</NavLink>
      <NavLink to="/settings">settings</NavLink>
    </nav>
  );
}

function NavLink({ to, children }: { to: To; children: React.ReactNode }) {
  return (
    <RouterNavLink to={to}>
      {({ isActive }) => {
        return (
          <Button disabled={isActive} variant="nav">
            {children}
          </Button>
        );
      }}
    </RouterNavLink>
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
    <RouterNavLink to={to} end>
      {({ isActive }) => {
        return (
          <Button disabled={isActive} variant="nav-sub">
            <div className="flex items-center gap-x-2">
              {icon}
              {children}
            </div>
            <ChevronRight strokeWidth={3} className="text-neutral-600" />
          </Button>
        );
      }}
    </RouterNavLink>
  );
}
