import { authenticator } from "@lib/services/auth.server";
import { ADMIN_USER_ID, PROVIDERS } from "@lib/services/auth/const";
import { migrateLegacySession } from "@lib/services/auth/helpers.server";
import { type Providers, getProviders } from "@lib/services/db/users.server";
import { sessionStorage } from "@lib/services/session.server";
import { use } from "react";
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
import { Button } from "~/components/ui/button";
import { AdminNav } from "~/routes/admin/nav";
import type { Route } from "./+types/account";

export async function loader({
  context: { userId, session },
}: Route.LoaderArgs) {
  const migrated = await migrateLegacySession(session);
  if (!migrated)
    return { userId, providers: userId ? getProviders(userId) : null };

  return data(
    {
      userId: migrated.userId,
      providers: userId ? getProviders(userId) : null,
    },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(migrated.session),
      },
    },
  );
}

export default function AccountPage({
  loaderData: { userId, providers },
}: Route.ComponentProps) {
  return (
    <main className="flex w-full flex-1 flex-col items-center gap-4 px-8 font-medium sm:flex-row sm:items-start sm:justify-center">
      <div className="flex max-w-sm flex-col gap-3 rounded-lg bg-card p-4 sm:flex-1">
        <div className="flex gap-3 *:*:w-full *:flex-1">
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
          {userId && (
            <Form method="post">
              <input type="hidden" name="mode" value="logout" />
              <Button type="submit" variant="secondary">
                Logout
              </Button>
            </Form>
          )}
        </div>

        <ProviderList providers={providers} />

        {userId === ADMIN_USER_ID && <AdminNav />}
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
  const cloned = request.clone();
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
    await authenticator.authenticate(provider, cloned);
  }
}
