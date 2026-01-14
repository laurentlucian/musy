import { spotifyFetch } from "../fetch";
import type { Albums } from "../types";

/**
 * Get multiple albums by IDs (max 20 IDs)
 */
export async function getAlbums(
  token: string,
  albumIds: string[],
): Promise<Albums> {
  return spotifyFetch<Albums>("https://api.spotify.com/v1/albums", {
    token,
    query: { ids: albumIds.slice(0, 20).join(",") },
  });
}
