import type { Profile } from '@prisma/client';

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
  preview_url: string | null
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
  };
  userId: string | null;
  user: Profile | null;
  owner?: { user: Profile | null };
  action: string;
  likedBy?: Profile[];
};
