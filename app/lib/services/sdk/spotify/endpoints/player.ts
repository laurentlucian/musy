import { spotifyFetch } from "../fetch";
import type {
  AddItemToPlaybackQueueOptionalParams,
  GetPlaybackStateParams,
  GetRecentlyPlayedTracksOptionalParams,
  PlaybackState,
  RecentlyPlayedTracks,
} from "../types";

/**
 * Get user's current playback state
 */
export async function getPlaybackState(
  token: string,
  params?: GetPlaybackStateParams,
): Promise<PlaybackState> {
  const query: Record<string, string | undefined> = {};
  if (params?.market) query.market = params.market;
  if (params?.additional_types)
    query.additional_types = params.additional_types;

  return spotifyFetch<PlaybackState>("https://api.spotify.com/v1/me/player", {
    token,
    query,
  });
}

/**
 * Get user's recently played tracks
 */
export async function getRecentlyPlayedTracks(
  token: string,
  options?: GetRecentlyPlayedTracksOptionalParams,
): Promise<RecentlyPlayedTracks> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.limit) query.limit = options.limit;
  if (options?.after) query.after = options.after;
  if (options?.before) query.before = options.before;

  return spotifyFetch<RecentlyPlayedTracks>(
    "https://api.spotify.com/v1/me/player/recently-played",
    {
      token,
      query,
    },
  );
}

/**
 * Add item to user's playback queue
 */
export async function addItemToPlaybackQueue(
  token: string,
  uri: string,
  options?: AddItemToPlaybackQueueOptionalParams,
): Promise<void> {
  const query: Record<string, string | undefined> = {
    uri,
  };
  if (options?.device_id) query.device_id = options.device_id;

  await spotifyFetch<unknown>("https://api.spotify.com/v1/me/player/queue", {
    token,
    method: "POST",
    query,
  });
}
