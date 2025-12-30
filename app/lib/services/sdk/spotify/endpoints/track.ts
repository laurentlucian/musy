import { spotifyFetch } from "../fetch";
import type { OptionalUserSavedTrackParams, UserSavedTracks } from "../types";

/**
 * Get user's saved tracks
 */
export async function getUsersSavedTracks(
  token: string,
  options?: OptionalUserSavedTrackParams,
): Promise<UserSavedTracks> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.limit) query.limit = options.limit;
  if (options?.offset) query.offset = options.offset;
  if (options?.market) query.market = options.market;

  return spotifyFetch<UserSavedTracks>("https://api.spotify.com/v1/me/tracks", {
    token,
    query,
  });
}

/**
 * Save tracks for current user
 */
export async function saveTracksforCurrentUser(
  token: string,
  trackIds: string[],
): Promise<void> {
  await spotifyFetch<unknown>("https://api.spotify.com/v1/me/tracks", {
    token,
    method: "PUT",
    query: { ids: trackIds.join(",") },
  });
}
