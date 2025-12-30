import { redirect } from "react-router";
import { authenticator } from "~/lib/services/auth.server";
import { SpotifyApiError } from "~/lib/services/sdk/spotify";
import { commitSession, getSession } from "~/lib/services/session.server";
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
    console.error("auth/callback/error", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof SpotifyApiError 
      ? String(error.status) 
      : error instanceof Error 
        ? error.constructor.name 
        : "unknown";
    
    const params = new URLSearchParams({
      error: errorMessage,
      code: errorCode,
    });
    
    return redirect(`/?${params.toString()}`);
  }
}

export default function Authenticate() {
  return null;
}
