import type { SimplifiedAlbum } from "./album.types.js";
import type {
  ExternalUrls,
  Followers,
  Image,
  PaginationParams,
  PaginationResponseProps,
} from "./shared.types.js";

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

export interface OptionalArtistAlbumParams extends PaginationParams {
  include_groups?: string;
  market?: string;
}

export interface ArtistAlbumResult extends PaginationResponseProps {
  items: (SimplifiedAlbum & { album_group: string })[];
}
