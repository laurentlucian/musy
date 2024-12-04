import { Suspense, use } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  data,
  redirect,
  useLocation,
  useParams,
} from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { PROVIDERS } from "~/services/auth/const";
import { getUserFromRequest } from "~/services/auth/helpers.server";
import { type Providers, getProviders } from "~/services/prisma/users.server";
import { sessionStorage } from "~/services/session.server";
import type { Route } from "./+types/account";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId, session, migrated } = await getUserFromRequest(request);
  const response = { userId, providers: userId ? getProviders(userId) : null };

  if (migrated) {
    return data(response, {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  return response;
}

export default function AccountPage({
  loaderData: { userId, providers },
}: Route.ComponentProps) {
  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-10 font-medium sm:flex-row sm:items-start sm:justify-center">
      <div className="flex w-full max-w-xs gap-3 rounded-lg bg-card p-4 sm:flex-col">
        {userId && (
          <Form method="post">
            <input type="hidden" name="mode" value="logout" />
            <Button type="submit" variant="secondary">
              Logout
            </Button>
          </Form>
        )}

        <Suspense fallback={<Waver />}>
          <ProviderList providers={providers} />
        </Suspense>
      </div>
      {userId && <Outlet />}
    </main>
  );
}

function ProviderList(props: {
  providers: Providers | null;
}) {
  const { pathname } = useLocation();
  const { provider } = useParams();
  const rest = provider ? pathname.split(provider)[1] : "";

  const providers = props.providers ? use(props.providers) : [];
  return PROVIDERS.map((provider) => {
    const isConnected = providers.some((p) => p.type === provider);

    if (isConnected)
      return (
        <NavLink
          key={provider}
          to={{
            pathname: `/account/${provider + rest}`,
          }}
          className="[&[aria-current]]:pointer-events-none"
        >
          {({ isActive }) => {
            return (
              <Button key={provider} disabled={isActive} className="capitalize">
                <p>{provider}</p>
              </Button>
            );
          }}
        </NavLink>
      );

    return (
      <Form key={provider} method="post">
        <input type="hidden" name="mode" value="authorize" />
        <input type="hidden" name="provider" value={provider} />
        <Button type="submit">
          <p className="flex items-center gap-x-1 font-medium">
            Login with <span className="capitalize">{provider}</span>
          </p>
        </Button>
      </Form>
    );
  });
}

export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const mode = data.get("mode");
  if (typeof mode !== "string") throw new Error("mode not found");

  if (mode === "logout") {
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return redirect("/account", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    });
  }

  if (mode === "authorize") {
    const provider = data.get("provider");
    if (typeof provider !== "string") throw new Error("invalid data");

    await authenticator.authenticate(provider, request);
  }
}
