import debug from "debug";
import invariant from "tiny-invariant";
import { transformTracks } from "~/services/prisma/spotify.server";
import { SpotifyService } from "~/services/sdk/spotify.server";

const log = debug("musy:top");

export async function syncUserTop(userId: string) {
  log("starting...", userId);

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const getUserSpotifyTop = async (
    range: "short_term" | "medium_term" | "long_term",
  ) => {
    const response = await client
      .getMyTopTracks({ limit: 50, time_range: range })
      .then((data) => data.body.items)
      .catch(() => []);
    const tracks = await transformTracks(response.map((track) => track));

    return {
      key: `profile_top_prisma${range}_${userId}`,
      tracks,
    };
  };

  const [_short, _medium, _long] = await Promise.all([
    getUserSpotifyTop("short_term"),
    getUserSpotifyTop("medium_term"),
    getUserSpotifyTop("long_term"),
  ]);

  log("completed", userId);
}
