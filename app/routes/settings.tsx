import { ArrowLeft } from "lucide-react";
import { data, Form, Link, Outlet, redirect, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { ADMIN_USER_ID, DEV } from "~/lib/services/auth/const";
import { sessionStorage } from "~/lib/services/session.server";
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

  return (
    <main className="flex w-full max-w-dvw flex-1 flex-col gap-4 px-8 font-medium">
      <div className="relative w-full">
        {!root && (
          <Link to="/settings" className="absolute top-0 left-0 sm:hidden">
            <ArrowLeft />
          </Link>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <div
          className="hidden flex-col gap-3 data-root:flex md:flex"
          data-root={root ? 1 : undefined}
        >
          {(userId === ADMIN_USER_ID || DEV) && <AdminNav />}
          {userId && (
            <Form method="post">
              <input type="hidden" name="mode" value="logout" />
              <Button type="submit" variant="nav-sub">
                logout
              </Button>
            </Form>
          )}
        </div>
        <Outlet />
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
    return redirect("/settings", {
      headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
    });
  }
}
