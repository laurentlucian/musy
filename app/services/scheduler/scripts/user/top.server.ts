import debug from "debug";
import { transformTracks } from "~/services/prisma/spotify.server";
import { getSpotifyClient } from "~/services/spotify.server";

const log = debug("musy:top");

export async function syncUserTop(userId: string) {
  log("starting...", userId);

  const { spotify } = await getSpotifyClient(userId);
  if (!spotify) {
    log("no spotify client");
    return;
  }

  const getUserSpotifyTop = async (
    range: "short_term" | "medium_term" | "long_term",
  ) => {
    const response = await spotify
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

  // TODO: Implement storage mechanism for top tracks
  // Could use Redis or database storage depending on requirements

  log("completed", userId);
}
