import { PROVIDERS } from "@lib/services/auth/const";
import { NavLink, Outlet, redirect } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/account.provider";

export function loader({ params: { provider } }: Route.LoaderArgs) {
  if (!PROVIDERS.includes(provider)) throw redirect("/account");
}

export default function AccountProvider({
  params: { provider },
}: Route.ComponentProps) {
  return (
    <Fragment>
      <div className="flex max-w-md gap-3 rounded-lg bg-card p-4 sm:flex-1 sm:flex-col">
        <NavLink
          to={{
            pathname: `/account/${provider}/liked`,
          }}
          className="[&[aria-current]>button]:bg-secondary aria-[current]:pointer-events-none"
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
          className="[&[aria-current]>button]:bg-secondary aria-[current]:pointer-events-none"
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
        <NavLink
          to={{
            pathname: `/account/${provider}/playlist`,
          }}
          className="[&[aria-current]>button]:bg-secondary aria-[current]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button
                key={provider}
                disabled={isActive}
                variant="ghost"
                className="w-full capitalize"
              >
                <p>Playlist</p>
              </Button>
            );
          }}
        </NavLink>
      </div>
      <Outlet />
    </Fragment>
  );
}
