import { spotifyFetch } from "../fetch";
import type {
  OptionalUserSavedTrackParams,
  Tracks,
  UserSavedTracks,
} from "../types";

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
 * Get tracks by IDs (max 50 IDs)
 */
export async function getTracks(
  token: string,
  trackIds: string[],
  market?: string,
): Promise<Tracks> {
  const query: Record<string, string | undefined> = {
    ids: trackIds.slice(0, 50).join(","),
  };
  if (market) query.market = market;

  return spotifyFetch<Tracks>("https://api.spotify.com/v1/tracks", {
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
