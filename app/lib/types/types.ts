import type { Playback, Profile, Settings, Track } from '@prisma/client';

export type { Track } from '@prisma/client';
export type Activity = {
  action: string;
  createdAt: Date;
  id: number;
  likedBy?: Profile[];
  owner?: { user: Profile | null };
  track: {
    albumName: string;
    albumUri: string;
    artist: string;
    artistUri: string;
    explicit: boolean;
    image: string;
    liked?: { user: Profile | null }[];
    link: string;
    name: string;
    preview_url: string | null;
    recent?: { user: Profile | null }[];
    uri: string;
  };
  trackId: string;
  user: Profile;
  userId: string;
};
export interface PlaylistTrack {
  description: string | null;
  image: string;
  isPublic: boolean;
  link: string;
  name: string;
  playlistId: string;
  trackTotal: number;
  tracks?: SpotifyApi.PlaylistObjectSimplified[];
  uri: string;
  userId?: string;
}

export interface User extends Profile {
  liked?: {
    trackId: string;
  }[];
  settings: Settings | null;
}

export type PendingCard = {
  bio: string | null;
  image: string;
  name: string;
  userId: string;
};

export type FriendCard = PendingCard & {
  playback:
    | (Playback & {
        track: Track;
      })
    | null;
  settings: { allowQueue: string; allowRecommend: string } | null;
};

export type Friend = {
  bio: string | null;
  image: string;
  name: string;
  playback:
    | (Playback & {
        track: Track;
      })
    | null;
  settings: { allowQueue: string; allowRecommend: string } | null;
  userId: string;
};

export type FriendsList = {
  friend: Friend;
};

export type Favorite = {
  favorite: Friend;
};
