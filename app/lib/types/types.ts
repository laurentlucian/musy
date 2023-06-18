import type { PlaybackHistory, Prisma, Profile, Track } from '@prisma/client';

import type { getAllUsers } from '~/services/prisma/users.server';

export type { Track } from '@prisma/client';
export type Activity = {
  action: string;
  createdAt: Date;
  id?: number;
  likedBy?: Profile[];
  owner?: { user: ProfileWithInfo | null };
  playback?: PlaybackHistory;
  track?: TrackWithInfo;
  trackId?: string;
  tracks?: TrackWithInfo[];
  user: ProfileWithInfo;
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

export type ProfileWithInfo = Prisma.PromiseReturnType<typeof getAllUsers>[number];

export type TrackWithInfo = Track & {
  liked?: {
    user: Profile;
  }[];
  queue?: {
    owner: { user: Profile | null };
  }[];
  recent?: {
    user: Profile;
  }[];
};
