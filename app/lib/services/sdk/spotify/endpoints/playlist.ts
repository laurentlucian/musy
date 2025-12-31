import { spotifyFetch } from "../fetch";
import type {
  OptionalPlaylistParams,
  OptionalPlaylistTracksParams,
  PaginationResponseProps,
  PlaylistObject,
  PlaylistTracksResponse,
  SimplifiedPlaylistObject,
} from "../types";

/**
 * Get current user's playlists
 */
export async function getCurrentUserPlaylists(
  token: string,
  options?: OptionalPlaylistParams,
): Promise<PaginationResponseProps & { items: SimplifiedPlaylistObject[] }> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.limit) query.limit = options.limit;
  if (options?.offset) query.offset = options.offset;
  if (options?.market) query.market = options.market;

  return spotifyFetch<
    PaginationResponseProps & { items: SimplifiedPlaylistObject[] }
  >("https://api.spotify.com/v1/me/playlists", {
    token,
    query,
  });
}

/**
 * Get a playlist
 */
export async function getPlaylist(
  token: string,
  playlistId: string,
  options?: OptionalPlaylistParams,
): Promise<PlaylistObject> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.market) query.market = options.market;

  return spotifyFetch<PlaylistObject>(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      token,
      query,
    },
  );
}

/**
 * Get playlist tracks
 */
export async function getPlaylistTracks(
  token: string,
  playlistId: string,
  options?: OptionalPlaylistTracksParams,
): Promise<PlaylistTracksResponse> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.limit) query.limit = options.limit;
  if (options?.offset) query.offset = options.offset;
  if (options?.market) query.market = options.market;
  if (options?.fields) query.fields = options.fields;

  return spotifyFetch<PlaylistTracksResponse>(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      token,
      query,
    },
  );
}
