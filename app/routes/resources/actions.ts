import { eq } from "drizzle-orm";
import { data, redirect } from "react-router";
import { userContext } from "~/context";
import { track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { logError } from "~/lib/utils";
import type { Route } from "./+types/actions";

export function loader() {
  throw redirect("/");
}

export async function action({
  request,
  context,
  params: { action },
}: Route.ActionArgs) {
  const userId = context.get(userContext);
  const form = await request.formData();

  if (!userId) return data({ error: "no user", type: action }, { status: 400 });

  if (action === "like") {
    const error = await like({ form, userId });
    return data({ error, type: "liked" });
  }

  async function like(args: { form: FormData; userId: string }) {
    const { userId, form } = args;
    const provider = form.get("provider");
    if (typeof provider !== "string") return "no provider";

    const uri = form.get("uri");
    if (typeof uri !== "string") return "no uri";

    const trackData = await db.query.track.findFirst({
      where: eq(track.uri, uri),
    });

    if (!trackData) return "no track";

    try {
      if (provider === "spotify") {
        const spotify = await getSpotifyClient({ userId });

        await spotify.track.saveTracksforCurrentUser([trackData.id]);
        return null;
      }
    } catch (error) {
      logError(error instanceof Error ? error.message : error);
      return "failure to like";
    }
  }

  async function _queue(args: { form: FormData; userId: string }) {
    const { form, userId } = args;
    const uri = form.get("uri");
    if (typeof uri !== "string") return "no uri";

    const provider = form.get("provider");
    if (typeof provider !== "string") return "no provider";

    if (provider === "spotify") {
      try {
        const spotify = await getSpotifyClient({ userId });
        await spotify.player.addItemToPlaybackQueue(uri, {});

        return null;
      } catch (error) {
        logError(error instanceof Error ? error.message : error);
        return "not listening";
      }
    }

    return "provider not supported";
  }
}

export default function Actions() {
  return null;
}
