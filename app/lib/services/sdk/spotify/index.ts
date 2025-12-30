// Main exports for Spotify SDK

export type { SpotifyClientConfig } from "./client";
export { createSpotifyClient } from "./client";
export type { SpotifyApiErrorProps } from "./errors";
export { SpotifyApiError } from "./errors";

// Export all types
export type {
  AddItemToPlaybackQueueOptionalParams,
  Artist,
  Artists,
  ArtistsUsersType,
  CurrentlyPlayingTrack,
  CurrentlyPlayingTrackParams,
  CurrentUserProfile,
  CursorProps,
  // Player types
  Devices,
  ExternalIds,
  // Shared types
  ExternalUrls,
  Followers,
  GetPlaybackStateParams,
  GetRecentlyPlayedTracksOptionalParams,
  Image,
  // Auth types
  OAuth2AccessTokenResponse,
  OptionalParams,
  OptionalUserSavedTrackParams,
  PaginationParams,
  PaginationResponseProps,
  PlaybackState,
  RecentlyPlayedTracks,
  RepeatState,
  Restrictions,
  ResumePlaybackParams,
  // Album types
  SimplifiedAlbum,
  // Artist types
  SimplifiedArtist,
  // Track types
  SimplifiedTrack,
  TopItemsOptionalParams,
  Track,
  Tracks,
  // User types
  UserProfile,
  UserSavedTracks,
  UsersTopItems,
  UsersTopItemsType,
  UserTrackEpisodeQueue,
} from "./types";
