import type { Profile, Settings } from '@prisma/client';

export interface Track {
  uri: string;
  trackId: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
  userId?: string;
  preview_url: string | null;
  link: string;
}

export type Activity = {
  id: number;
  createdAt: Date;
  trackId: string | null;
  track: {
    uri: string;
    name: string;
    image: string;
    albumUri: string;
    albumName: string;
    artist: string;
    artistUri: string;
    explicit: boolean;
    preview_url?: string | null;
    link: string;
    liked?: { user: Profile | null }[];
    recent?: { user: Profile | null }[];
  };
  userId: string | null;
  user: Profile | null;
  owner?: { user: Profile | null };
  action: string;
  likedBy?: Profile[];
};
export interface PlaylistTrack {
  uri: string;
  name: string;
  link: string;
  image: string;
  trackTotal: number;
  tracks?: SpotifyApi.PlaylistObjectSimplified[];
  userId?: string;
  isPublic: boolean;
  playlistId: string;
  description: string | null;
}

export interface User extends Profile {
  settings: Settings | null;
  liked?: {
    trackId: string;
  }[];
}
