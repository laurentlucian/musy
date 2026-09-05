import { LogOut } from "lucide-react";
import {
  data,
  Form,
  Link,
  Outlet,
  redirect,
  useLocation,
  useNavigation,
} from "react-router";
import { HistoryImport } from "~/components/domain/history-import";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { ADMIN_USER_ID, DEV } from "~/lib.server/services/auth/const";
import { sessionStorage } from "~/lib.server/services/session";
import { AdminNav } from "~/routes/admin/nav";
import type { Route } from "./+types/settings";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);

  return data({
    userId,
  });
}

export default function Settings({
  loaderData: { userId },
}: Route.ComponentProps) {
  const { pathname } = useLocation();
  const root = pathname === "/settings";
  const navigation = useNavigation();

  return (
    <main className="mx-auto w-full max-w-6xl py-4">
      <header className="mb-6 border-b border-border pb-4">
        <h1 className="font-semibold text-2xl sm:text-3xl">Settings</h1>
      </header>
      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="flex shrink-0 flex-col gap-6 md:w-44">
          {(userId === ADMIN_USER_ID || DEV) && <AdminNav />}
          {userId && (
            <Form
              method="post"
              action="/settings"
              className="border-t border-border pt-5"
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
              <HistoryImport />
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

export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const mode = data.get("mode");
  if (typeof mode !== "string") throw new Error("mode not found");

  if (mode === "logout") {
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    });
  }
}
