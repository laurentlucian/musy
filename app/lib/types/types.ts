import type { Playback, Prisma, Profile, Settings, Track } from '@prisma/client';

import type { getCurrentUser } from '~/services/prisma/users.server';

export type { Track } from '@prisma/client';
export type Activity = {
  action: string;
  createdAt: Date;
  id: number;
  likedBy?: Profile[];
  owner?: { user: Profile | null };
  track: TrackWithInfo;
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

export type CurrentUser = Prisma.PromiseReturnType<typeof getCurrentUser>;

export type User = Prisma.ProfileGetPayload<{
  include: {
    liked: {
      select: {
        trackId: true;
      };
    };
    settings: true;
  };
}>;

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

export type ProfileWithInfo = Profile & {
  playback:
    | (Playback & {
        track: Track;
      })
    | null;
  settings: Settings | null;
};
