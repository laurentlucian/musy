import { refreshAccessToken } from "./endpoints/auth";
import * as playerEndpoints from "./endpoints/player";
import * as playlistEndpoints from "./endpoints/playlist";
import * as trackEndpoints from "./endpoints/track";
import * as userEndpoints from "./endpoints/user";
import type {
  AddItemToPlaybackQueueOptionalParams,
  ArtistsUsersType,
  GetPlaybackStateParams,
  GetRecentlyPlayedTracksOptionalParams,
  OptionalPlaylistParams,
  OptionalPlaylistTracksParams,
  OptionalUserSavedTrackParams,
  TopItemsOptionalParams,
  UsersTopItemsType,
} from "./types";

export interface SpotifyClientConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

/**
 * Create a Spotify client instance with functional API
 * Returns an object with nested methods matching spotified API shape
 */
export function createSpotifyClient(config: SpotifyClientConfig) {
  const { accessToken, clientId, clientSecret } = config;

  return {
    /**
     * Set bearer token and return new client instance (immutable pattern)
     */
    setBearerToken: (token: string) =>
      createSpotifyClient({ ...config, accessToken: token }),

    auth: {
      AuthorizationCode: {
        refreshAccessToken: (refreshToken: string) =>
          refreshAccessToken({ clientId, clientSecret }, refreshToken),
      },
    },

    user: {
      getCurrentUserProfile: () => userEndpoints.getUserProfile(accessToken),

      getUserTopItems: (
        type: UsersTopItemsType,
        options?: TopItemsOptionalParams,
      ) => userEndpoints.getUserTopItems(accessToken, type, options),

      checkIfUserFollowsArtistsOrUsers: (
        type: ArtistsUsersType,
        ids: string[],
      ) =>
        userEndpoints.checkIfUserFollowsArtistsOrUsers(accessToken, type, ids),
    },

    track: {
      getUsersSavedTracks: (options?: OptionalUserSavedTrackParams) =>
        trackEndpoints.getUsersSavedTracks(accessToken, options),

      getTracks: (trackIds: string[], market?: string) =>
        trackEndpoints.getTracks(accessToken, trackIds, market),

      saveTracksforCurrentUser: (trackIds: string[]) =>
        trackEndpoints.saveTracksforCurrentUser(accessToken, trackIds),
    },

    player: {
      addItemToPlaybackQueue: (
        uri: string,
        options?: AddItemToPlaybackQueueOptionalParams,
      ) => playerEndpoints.addItemToPlaybackQueue(accessToken, uri, options),

      getRecentlyPlayedTracks: (
        options?: GetRecentlyPlayedTracksOptionalParams,
      ) => playerEndpoints.getRecentlyPlayedTracks(accessToken, options),

      getPlaybackState: (params?: GetPlaybackStateParams) =>
        playerEndpoints.getPlaybackState(accessToken, params),
    },

    playlist: {
      getCurrentUserPlaylists: (options?: OptionalPlaylistParams) =>
        playlistEndpoints.getCurrentUserPlaylists(accessToken, options),

      getPlaylist: (playlistId: string, options?: OptionalPlaylistParams) =>
        playlistEndpoints.getPlaylist(accessToken, playlistId, options),

      getPlaylistTracks: (
        playlistId: string,
        options?: OptionalPlaylistTracksParams,
      ) =>
        playlistEndpoints.getPlaylistTracks(accessToken, playlistId, options),

      createPlaylist: (
        userId: string,
        options: {
          name: string;
          description?: string;
          public?: boolean;
          collaborative?: boolean;
        },
      ) => playlistEndpoints.createPlaylist(accessToken, userId, options),

      addTracksToPlaylist: (
        playlistId: string,
        uris: string[],
        position?: number,
      ) =>
        playlistEndpoints.addTracksToPlaylist(accessToken, playlistId, uris, position),
    },
  };
}
