export type SpotifyPlayerCallback = (token: string) => void;

export type SpotifyAlbum = {
  images: SpotifyImage[];
  name: string;
  uri: string;
};

export type SpotifyArtist = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
  url: string;
};

type MiniArtist = {
  name: string;
  uri: string;
  url: string;
};

export type SpotifyDevice = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
};

export type SpotifyImage = {
  height: number;
  url: string;
  width: number;
};

export type SpotifyPlayOptions = {
  context_uri?: string;
  deviceId: string;
  offset?: number;
  uris?: string[];
};

export type SpotifyPlayerStatus = {
  actions: {
    disallows: {
      resuming: boolean;
      skipping_prev: boolean;
    };
  };
  context: null;
  currently_playing_type: string;
  device: SpotifyDevice;
  is_playing: boolean;
  item: {
    album: {
      album_type: string;
      artists: SpotifyArtist[];
      available_markets: string[];
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      images: SpotifyImage[];
      name: string;
      release_date: string;
      release_date_precision: string;
      total_tracks: number;
      type: string;
      uri: string;
    };
    artists: SpotifyArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: false;
    external_ids: {
      isrc: string;
    };
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    is_local: false;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
  };
  progress_ms: number;
  repeat_state: string;
  shuffle_state: false;
  timestamp: number;
};

export type SpotifyPlayerTrack = {
  artists: MiniArtist[];
  durationMs: number;
  id: string;
  image: string;
  name: string;
  uri: string;
};

export type SpotifyPlaylist = {
  description: string | null;
  image: string;
  name: string;
  playlistUri: string | null;
  uri: string;
};

export type WebPlaybackArtist = {
  name: string;
  uri: string;
};
