import { LogOut } from "lucide-react";
import {
  data,
  Form,
  Link,
  NavLink,
  Outlet,
  redirect,
  useActionData,
  useLocation,
  useNavigation,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { userContext } from "~/context";
import { ADMIN_USER_ID, DEV } from "~/lib.server/services/auth/const";
import { getProfile } from "~/lib.server/services/db/users";
import { sessionStorage } from "~/lib.server/services/session";
import { saveUsername } from "~/lib.server/services/usernames";
import { AdminNav } from "~/routes/admin/nav";
import type { Route } from "./+types/settings";

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = context.get(userContext);

  return data({
    userId,
    profile: userId ? await getProfile(userId) : null,
    origin: new URL(request.url).origin,
  });
}

export default function Settings({
  loaderData: { userId, profile, origin },
}: Route.ComponentProps) {
  const { pathname } = useLocation();
  const root = pathname.replace(/\/$/, "") === "/settings";
  const navigation = useNavigation();
  const result = useActionData<typeof action>();
  const saving = navigation.formData?.get("mode") === "username";

  return (
    <main className="py-4">
      <header className="mb-6 border-border border-b pb-4">
        <h1 className="font-semibold text-2xl sm:text-3xl">Settings</h1>
      </header>
      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="flex shrink-0 flex-col gap-6 md:w-44">
          <nav aria-label="Settings" className="flex flex-col gap-1">
            <NavLink
              to="/settings"
              end
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
              }
            >
              Account
            </NavLink>
          </nav>
          {(userId === ADMIN_USER_ID || DEV) && <AdminNav />}
          {userId && (
            <Form
              method="post"
              action="/settings"
              className="border-border border-t pt-5"
            >
              <input type="hidden" name="mode" value="logout" />
              <Button
                type="submit"
                variant="ghost"
                disabled={navigation.formData?.get("mode") === "logout"}
              >
                <LogOut className="size-4" />{" "}
                {navigation.formData?.get("mode") === "logout"
                  ? "Signing out…"
                  : "Sign out"}
              </Button>
            </Form>
          )}
        </aside>
        <div className="min-w-0 flex-1">
          {root ? (
            userId ? (
              <section className="max-w-md space-y-6">
                <h2 className="font-semibold text-lg">Account</h2>
                <div className="space-y-2">
                  <label htmlFor="user-id" className="font-medium text-sm">
                    User ID
                  </label>
                  <Input id="user-id" value={userId} readOnly />
                </div>
                <Form method="post" action="/settings" className="space-y-4">
                  <input type="hidden" name="mode" value="username" />
                  <div className="space-y-2">
                    <label htmlFor="username" className="font-medium text-sm">
                      Username
                    </label>
                    <Input
                      key={profile?.username ?? ""}
                      id="username"
                      name="username"
                      defaultValue={profile?.username ?? ""}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      minLength={3}
                      maxLength={30}
                      required
                      pattern={"[a-zA-Z][a-zA-Z0-9_\\-]{2,29}"}
                      aria-describedby="username-help username-result"
                      aria-invalid={!!result?.error}
                    />
                    <p
                      id="username-help"
                      className="text-muted-foreground text-sm"
                    >
                      3–30 letters, numbers, underscores or hyphens. Start with
                      a letter.
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Profile URL</p>
                    <Link
                      to={`/profile/${profile?.username || userId}`}
                      className="break-all text-muted-foreground underline underline-offset-4"
                    >
                      {origin}/profile/{profile?.username || userId}
                    </Link>
                  </div>
                  <p
                    id="username-result"
                    role={result?.error ? "alert" : "status"}
                    className={
                      result?.error
                        ? "text-destructive text-sm"
                        : "text-muted-foreground text-sm"
                    }
                  >
                    {result?.error ||
                      (result?.saved ? "Username saved." : null)}
                  </p>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </Form>
              </section>
            ) : (
              <Button asChild>
                <Link to="/">Sign in</Link>
              </Button>
            )
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </main>
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const mode = formData.get("mode");
  if (typeof mode !== "string") throw new Error("mode not found");

  if (mode === "logout") {
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    });
  }

  if (mode === "username") {
    const userId = context.get(userContext);
    if (!userId)
      return data(
        { error: "Sign in to set a username.", saved: false },
        { status: 401 },
      );
    const username = formData.get("username");
    if (typeof username !== "string")
      return data(
        { error: "Enter a username.", saved: false },
        { status: 400 },
      );
    const error = await saveUsername(userId, username);
    return data({ error, saved: !error }, { status: error ? 400 : 200 });
  }
}
