import { type ActionFunctionArgs, data, redirect } from "react-router";
import { logError } from "~/lib/utils";
import { getUserFromRequest } from "~/services/auth/helpers.server";
import { prisma } from "~/services/db.server";
import { GoogleService } from "~/services/sdk/google.server";
import { SpotifyService } from "~/services/sdk/spotify.server";
import { youtube } from "~/services/sdk/youtube/helpers.server";

export function loader() {
  throw redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const provider = formData.get("provider");
  if (typeof provider !== "string")
    return data({ error: "no provider" }, { status: 400 });

  const { userId } = await getUserFromRequest(request);
  if (!userId) return data({ error: "no user id" }, { status: 400 });

  const uri = formData.get("uri");
  if (typeof uri !== "string")
    return data({ error: "no uri" }, { status: 400 });

  const track = await prisma.track.findFirst({
    select: { id: true, name: true, artist: true },
    where: {
      uri,
    },
  });

  if (!track) return data({ error: "track not found" }, { status: 400 });

  if (provider === "spotify") {
    const spotify = await SpotifyService.createFromUserId(userId);
    const client = spotify.getClient();
    try {
      await client.addToMySavedTracks([track.id]);
      return data({ error: null });
    } catch (error) {
      logError(error instanceof Error ? error.message : error);
      return data({ error: "failure to like" }, { status: 500 });
    }
  }

  if (provider === "google") {
    const uri = formData.get("uri");
    if (typeof uri !== "string")
      return data({ error: "no uri" }, { status: 400 });

    const google = await GoogleService.createFromUserId(userId);
    try {
      const search = await youtube.search(
        google,
        `${track.name} - ${track.artist}`,
      );

      const first = search[0];

      await youtube.addToLibrary(google, first.videoId);

      return data({ error: null });
    } catch (error) {
      logError(error instanceof Error ? error.message : error);
      return data({ error: "failure to like" }, { status: 500 });
    }
  }
}
