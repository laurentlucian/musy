import {
  updateUserImage,
  updateUserName,
} from "@lib/services/prisma/users.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import invariant from "tiny-invariant";

export async function syncUserProfile(userId: string) {
  log("starting...", "profile");

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const spotifyProfile = await client.getMe();

  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(userId, pfp[0]?.url || pfp[1]?.url);
  }

  const name = spotifyProfile?.body.display_name;
  if (name) {
    await updateUserName(userId, name);
  }

  log("completed", "profile");
}
