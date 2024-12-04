import { NavLink, Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/account.provider";

export default function AccountProvider({
  params: { provider },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-1 items-start gap-4">
      <div className="flex w-full max-w-xs gap-3 rounded-lg bg-card p-4 sm:flex-col">
        <NavLink
          to={{
            pathname: `/account/${provider}/liked`,
          }}
          className="[&[aria-current]]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button key={provider} disabled={isActive} className="capitalize">
                <p>Liked</p>
              </Button>
            );
          }}
        </NavLink>
        <NavLink
          to={{
            pathname: `/account/${provider}/recent`,
          }}
          className="[&[aria-current]]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button key={provider} disabled={isActive} className="capitalize">
                <p>Recent</p>
              </Button>
            );
          }}
        </NavLink>
      </div>
      <Outlet />
    </article>
  );
}
