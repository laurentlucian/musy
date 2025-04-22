import { PROVIDERS } from "@lib/services/auth/const";
import { Outlet, redirect } from "react-router";
import { NavLinkSub } from "~/components/domain/nav";
import type { Route } from "./+types/account.provider";

export function loader({
  context: { userId },
  params: { provider },
}: Route.LoaderArgs) {
  if (!userId) throw redirect("/account");
  if (!PROVIDERS.includes(provider)) throw redirect("/account");
}

export default function AccountProvider({
  params: { provider },
}: Route.ComponentProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <NavLinkSub
        to={{
          pathname: `/account/${provider}/liked`,
        }}
      >
        liked
      </NavLinkSub>
      <NavLinkSub
        to={{
          pathname: `/account/${provider}/recent`,
        }}
      >
        recent
      </NavLinkSub>
      <NavLinkSub
        to={{
          pathname: `/account/${provider}/playlist`,
        }}
      >
        playlist
      </NavLinkSub>

      <Outlet />
    </div>
  );
}
