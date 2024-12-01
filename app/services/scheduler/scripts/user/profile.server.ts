import debug from "debug";
import {
  updateUserImage,
  updateUserName,
} from "~/services/prisma/users.server";
import { getSpotifyClient } from "~/services/spotify.server";

const log = debug("musy:profile");

export async function syncUserProfile(userId: string) {
  log("starting...");

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    log("no spotify client");
    return;
  }

  const spotifyProfile = await spotify.getMe();

  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(userId, pfp[0]?.url || pfp[1]?.url);
  }

  const name = spotifyProfile?.body.display_name;
  if (name) {
    await updateUserName(userId, name);
  }

  log("completed");
}
