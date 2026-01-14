// Extracted types from spotified library
// These types match the spotified library's type definitions exactly

// Shared types
export type NumberString = number | string;
export type BooleanString = boolean | string;
export type TypeOrArrayOf<T> = T | T[];

export interface ExternalUrls {
  spotify?: string;
}

export interface ExternalIds {
  upc?: string;
  ean?: string;
  isrc?: string;
}

export interface Image {
  height: number | null;
  url: string;
  width: number | null;
}

export interface Followers {
  href: string | null;
  total: number;
}

export interface Restrictions {
  reason?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OptionalParams {
  market?: string;
}

export interface CursorProps {
  after?: string;
  before?: string;
}

export interface PaginationResponseProps {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

// Artist types
export interface SimplifiedArtist {
  external_urls?: ExternalUrls;
  href?: string;
  id?: string;
  name?: string;
  type?: string;
  uri?: string;
}

export interface Artist extends SimplifiedArtist {
  followers?: Followers;
  genres?: string[];
  images?: Image[];
  popularity?: number;
}

export interface Artists {
  artists: Artist[];
}

// Album types
export interface Copyright {
  text: string;
  type: string;
}

export interface SimplifiedAlbum {
  album_type: string;
  artists: SimplifiedArtist[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: Restrictions;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Album extends SimplifiedAlbum {
  copyrights: Copyright[];
  external_ids: ExternalIds;
  genres: string[];
  label: string;
  popularity: number;
  tracks: PaginationResponseProps & { items: SimplifiedTrack[] };
}

export interface Albums {
  albums: Album[];
}

// Track types
export interface SimplifiedTrack {
  artists?: SimplifiedArtist[];
  available_markets?: string[];
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: ExternalUrls;
  href?: string;
  id?: string;
  is_playable?: boolean;
  linked_from?: Partial<{
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
  }>;
  restrictions?: Restrictions;
  name?: string;
  preview_url?: string | null;
  track_number?: number;
  type?: string;
  uri?: string;
  is_local?: boolean;
}

export interface Track extends SimplifiedTrack {
  album?: SimplifiedAlbum;
  external_ids?: ExternalIds;
  popularity?: number;
}

export interface Tracks {
  tracks: Track[];
}

export interface OptionalUserSavedTrackParams extends PaginationParams {
  market?: string;
}

interface SavedTrack {
  added_at: string;
  track: Track;
}

export interface UserSavedTracks extends PaginationResponseProps {
  items: SavedTrack[];
}

// User types
interface ExplicitContent {
  filter_enabled: boolean;
  filter_locked: boolean;
}

export interface UserProfile {
  display_name: string | null;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  type: string;
  uri: string;
}

export interface CurrentUserProfile extends UserProfile {
  country: string;
  email: string;
  product: string;
  explicit_content: ExplicitContent;
}

export type UsersTopItemsType = "artists" | "tracks";
export type ArtistsUsersType = "artist" | "user";

export interface TopItemsOptionalParams extends PaginationParams {
  time_range?: "long_term" | "medium_term" | "short_term";
}

export interface UsersTopItems extends PaginationResponseProps {
  items: Artist[] | Track[];
}

// Player types
interface Device {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
}

export interface Devices {
  devices: Device[];
}

interface Actions {
  interrupting_playback?: boolean;
  pausing?: boolean;
  resuming?: boolean;
  seeking?: boolean;
  skipping_next?: boolean;
  skipping_prev?: boolean;
  toggling_repeat_context?: boolean;
  toggling_shuffle?: boolean;
  toggling_repeat_track?: boolean;
  transferring_playback?: boolean;
}

interface Context {
  type?: string;
  href?: string;
  external_urls?: ExternalUrls;
  uri?: string;
}

// Episode type (simplified for PlaybackState)
interface Episode {
  type: "episode";
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface PlaybackState {
  device?: Device;
  repeat_state?: string;
  shuffle_state?: boolean;
  context?: Context | null;
  timestamp?: number;
  progress_ms?: number;
  is_playing?: boolean;
  item?: Track | Episode | null;
  currently_playing_type?: string;
  actions?: Actions;
}

export interface GetPlaybackStateParams {
  market?: string;
  additional_types?: string;
}

export type CurrentlyPlayingTrack = PlaybackState;
export type CurrentlyPlayingTrackParams = GetPlaybackStateParams;

interface PlayerOptionalParams {
  device_id?: string;
}

export type SeekToPositionOptionalParam = PlayerOptionalParams;
export interface TransferPlaybackOptionalParams {
  play?: boolean;
}

export type RepeatState = "track" | "context" | "off";
export type SetRepeatModeOptionalParams = PlayerOptionalParams;
export type SetPlaybackVolumeOptionalParams = PlayerOptionalParams;
export type TogglePlaybackShuffleOptionalParams = PlayerOptionalParams;

export interface UserTrackEpisodeQueue {
  currently_playing: Track | Episode | null;
  queue: Track[] | Episode[];
}

export type AddItemToPlaybackQueueOptionalParams = PlayerOptionalParams;

interface PositionOffset {
  position: number;
}

interface URIOffset {
  uri: string;
}

export interface ResumePlaybackParams {
  context_uri?: string;
  uris?: string[];
  position_ms?: number;
  offset?: PositionOffset | URIOffset;
}

export interface GetRecentlyPlayedTracksOptionalParams {
  limit?: number;
  after?: number;
  before?: number;
}

interface PlayHistoryObject {
  track?: Track;
  played_at?: string;
  context?: Context;
}

export interface RecentlyPlayedTracks {
  href?: string;
  limit?: number;
  next?: string;
  cursors?: CursorProps;
  total?: number;
  items?: PlayHistoryObject[];
}

// Playlist types
export interface SimplifiedPlaylistObject {
  collaborative: boolean;
  description: string | null;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: UserProfile;
  public: boolean | null;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
}

export interface PlaylistObject extends SimplifiedPlaylistObject {
  followers?: Followers;
  primary_color?: string | null;
}

export interface PlaylistTracksResponse extends PaginationResponseProps {
  items: Array<{
    added_at: string;
    added_by?: UserProfile;
    is_local: boolean;
    track: Track | null;
  }>;
}

export interface OptionalPlaylistParams extends PaginationParams {
  market?: string;
}

export interface OptionalPlaylistTracksParams extends PaginationParams {
  market?: string;
  fields?: string;
}

// Auth types
export interface OAuth2AccessTokenResponse {
  token_type: "bearer";
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}
