import type { Prisma, Profile, Track } from '@prisma/client';

import type { getFeed } from '~/services/prisma/tracks.server';
import type { getAllUsers } from '~/services/prisma/users.server';

export type { Track } from '@prisma/client';

export type Activity = Prisma.PromiseReturnType<typeof getFeed>[number];

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
export type Feed = Prisma.PromiseReturnType<typeof getFeed>;

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
