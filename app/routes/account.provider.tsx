import { NavLink, Outlet } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/account.provider";

export default function AccountProvider({
  params: { provider },
}: Route.ComponentProps) {
  return (
    <Fragment>
      <div className="flex gap-3 rounded-lg bg-card p-4 sm:flex-1 sm:flex-col">
        <NavLink
          to={{
            pathname: `/account/${provider}/liked`,
          }}
          className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button
                key={provider}
                disabled={isActive}
                variant="ghost"
                className="w-full capitalize"
              >
                <p>Liked</p>
              </Button>
            );
          }}
        </NavLink>
        <NavLink
          to={{
            pathname: `/account/${provider}/recent`,
          }}
          className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button
                key={provider}
                disabled={isActive}
                variant="ghost"
                className="w-full capitalize"
              >
                <p>Recent</p>
              </Button>
            );
          }}
        </NavLink>
      </div>
      <Outlet />
    </Fragment>
  );
}
