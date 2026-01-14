import { spotifyFetch } from "../fetch";
import type { Artists } from "../types";

/**
 * Get multiple artists by IDs (max 50 IDs)
 */
export async function getArtists(
  token: string,
  artistIds: string[],
): Promise<Artists> {
  return spotifyFetch<Artists>("https://api.spotify.com/v1/artists", {
    token,
    query: { ids: artistIds.slice(0, 50).join(",") },
  });
}
