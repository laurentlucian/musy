import { prisma } from "@lib/services/db.server";
import { getGoogleClientsFromUserId } from "@lib/services/sdk/google.server";
import { youtube } from "@lib/services/sdk/helpers/youtube.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { logError } from "@lib/utils";
import { data, redirect } from "react-router";
import type { Route } from "./+types/actions";

export function loader() {
  throw redirect("/");
}

export async function action({
  request,
  context: { userId },
  params: { action },
}: Route.ActionArgs) {
  if (!userId) return data({ error: "no user" }, { status: 400 });

  if (action === "like") return like({ request, userId });
  if (action === "thanks") return thanks({ request, userId });

  return data({ error: "no action" }, { status: 400 });
}

async function like(args: { request: Request; userId: string }) {
  const { request, userId } = args;
  const formData = await request.formData();
  const provider = formData.get("provider");
  if (typeof provider !== "string")
    return data({ error: "no provider" }, { status: 400 });

  const uri = formData.get("uri");
  if (typeof uri !== "string")
    return data({ error: "no uri" }, { status: 400 });

  const track = await prisma.track.findFirst({
    select: { id: true, name: true, artist: true },
    where: {
      uri,
    },
  });

  if (!track) return data({ error: "no track" }, { status: 400 });

  try {
    if (provider === "spotify") {
      const spotify = await SpotifyService.createFromUserId(userId);
      const client = spotify.getClient();
      await client.addToMySavedTracks([track.id]);
      return data({ error: null });
    }

    if (provider === "google") {
      const uri = formData.get("uri");
      if (typeof uri !== "string")
        return data({ error: "no uri" }, { status: 400 });

      const { youtube: yt } = await getGoogleClientsFromUserId(userId);
      const search = await youtube.search(
        yt,
        `${track.name} - ${track.artist}`,
      );
      const first = search[0];
      await youtube.addToLibrary(yt, first.videoId);

      return data({ error: null });
    }
  } catch (error) {
    logError(error instanceof Error ? error.message : error);
    return data({ error: "failure to like" }, { status: 500 });
  }
}

async function thanks(args: { request: Request; userId: string }) {
  const { request, userId } = args;
  const formData = await request.formData();

  const uri = formData.get("uri");
  if (typeof uri !== "string")
    return data({ error: "no uri" }, { status: 400 });

  const track = await prisma.track.findFirst({
    select: { id: true },
    where: { uri },
  });

  if (!track) return data({ error: "no track" }, { status: 400 });

  await prisma.thanks.create({
    data: { trackId: track.id, userId },
  });

  return data({ error: null });
}
