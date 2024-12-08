import { authenticator } from "@lib/services/auth.server";
import { commitSession, getSession } from "@lib/services/session.server";
import { redirect } from "react-router";
import type { Route } from "./+types/authenticate";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const user = await authenticator.authenticate(params.provider, request);
    const session = await getSession(request.headers.get("cookie"));
    session.set("data", user);

    return redirect("/account", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("auth/callback/error", error);
    return redirect("/account");
  }
}
