import { redirect } from "react-router";
import { errorMessage, logError } from "~/components/utils";
import { SpotifyApiError } from "~/lib.server/sdk/spotify";
import { authenticator } from "~/lib.server/services/auth";
import { commitSession, getSession } from "~/lib.server/services/session";
import type { Route } from "./+types/authenticate";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const user = await authenticator.authenticate(params.provider, request);
    const session = await getSession(request.headers.get("cookie"));
    session.set("data", user);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    logError(`auth/callback/error: ${errorMessage(error)}`, "auth");

    const message = errorMessage(error);
    const errorCode =
      error instanceof SpotifyApiError
        ? String(error.status)
        : error instanceof Error
          ? error.constructor.name
          : "unknown";

    const params = new URLSearchParams({
      error: message,
      code: errorCode,
    });

    return redirect(`/?${params.toString()}`);
  }
}

export default function Authenticate() {
  return null;
}
