import type { SimplifiedAlbum } from "./album.types.js";
import type { Artist } from "./artist.types.js";
import type { SimplifiedAudiobook } from "./audiobook.types.js";
import type { SimplifiedEpisode } from "./episode.types.js";
import type { SimplifiedPlaylist } from "./playlist.types.js";
import type {
  PaginationParams,
  PaginationResponseProps,
} from "./shared.types.js";
import type { SimplifiedShow } from "./show.types.js";
import type { Track } from "./track.types.js";

export interface SearchOptionalParams extends PaginationParams {
  market?: string;
  include_external?: string;
}

export interface SearchResponse {
  tracks?: { items: Track[] } & PaginationResponseProps;
  artists?: { items: Artist[] } & PaginationResponseProps;
  albums?: { items: SimplifiedAlbum[] } & PaginationResponseProps;
  playlists?: { items: SimplifiedPlaylist[] } & PaginationResponseProps;
  shows?: { items: SimplifiedShow[] } & PaginationResponseProps;
  episodes?: { items: SimplifiedEpisode[] } & PaginationResponseProps;
  audiobooks?: { items: SimplifiedAudiobook[] } & PaginationResponseProps;
}
