import type { Playback, Prisma, Profile, Settings, Track } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { userQ } from '~/services/scheduler/jobs/user.server';

import { authenticator } from '../auth.server';
import { profileWithInfo, trackWithInfo } from './tracks.server';

export type UserProfile = Prisma.PromiseReturnType<typeof getUser>;

type CreateUser = {
  accessToken: string;
  expiresAt: number;
  id: string;
  refreshToken: string;
  tokenType: string;
  user: {
    create: {
      email: string;
      image: string;
      name: string;
    };
  };
};

export const createUser = async (data: CreateUser) => {
  const newUser = await prisma.user.create({ data, include: { user: true } });

  // scrape user's liked songs
  await userQ.add(newUser.id, { userId: newUser.id });

  // repeat the scrape every hour
  await userQ.add(
    newUser.id,
    { userId: newUser.id },
    {
      backoff: {
        delay: 1000 * 60 * 60,
        type: 'fixed',
      },
      // a job with an id that already exists will not be added.
      jobId: newUser.id,
      repeat: { every: 1000 * 60 * 60 },
    },
  );

  return newUser;
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ include: { user: true }, where: { id } });
  if (!user || !user.user) return null;
  return user;
};

export const updateToken = async (
  id: string,
  token: string,
  expiresAt: number,
  refreshToken?: string,
) => {
  const data = await prisma.user.update({
    data: { accessToken: token, expiresAt, refreshToken, revoked: false },
    where: { id },
  });
  console.log('updateToken -> data', new Date(data.expiresAt).toLocaleTimeString('en-US'));
  return data.expiresAt;
};

export const updateUserImage = async (id: string, image: string) => {
  const data = await prisma.profile.update({ data: { image }, where: { userId: id } });
  return data;
};

export const updateUserName = async (id: string, name: string) => {
  const data = await prisma.profile.update({ data: { name }, where: { userId: id } });
  return data;
};

export const getCurrentUserId = async (request: Request) => {
  const session = await authenticator.isAuthenticated(request);
  if (!session || !session.user) throw new Response('Unauthorized', { status: 401 });
  return session.user.id;
};

export const getCurrentUser = async (request: Request) => {
  const session = await authenticator.isAuthenticated(request);
  if (!session || !session.user) return null;
  const userId = session.user.id;
  let data = await prisma.profile.findUnique({
    include: {
      block: { select: { blockedId: true } },
      favorite: { select: { favoriteId: true } },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
      liked: { select: { trackId: true } },
      mute: true,
      playback: {
        include: {
          track: trackWithInfo,
        },
      },
      playbacks: {
        orderBy: { endedAt: 'desc' },
        take: 1,
      },
      recent: {
        include: {
          track: trackWithInfo,
        },
        orderBy: { playedAt: 'desc' },
        take: 4,
      },
      recommended: { select: { trackId: true } },
      settings: { include: { profileSong: true } },
    },

    where: { userId },
  });
  if (!data) return null;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.profile.findUnique({
    include: {
      ai: true,
      playback: {
        include: {
          track: trackWithInfo,
        },
      },
      settings: true,
    },
    where: { userId },
  });

  if (!user /* || (!session && user.settings?.isPrivate) */)
    throw new Response('Not found', { status: 404 });

  return user;
};

export type AllUsers = (Profile & {
  playback:
    | (Playback & {
        track: Track & {
          liked: {
            user: Profile;
          }[];
          recent: {
            user: Profile;
          }[];
        };
      })
    | null;
  settings: Settings | null;
})[];

export const getAllUsersId = async () =>
  prisma.user
    .findMany({
      select: {
        id: true,
      },
      where: {
        revoked: false,
      },
    })
    .then((users) => users.map((u) => u.id));

export const getAllUsers = async (id: string) => {
  // const restrict = !isAuthenticated
  //   ? { user: { settings: { isNot: { isPrivate: true } } } }
  //   : undefined;

  const users = await prisma.profile.findMany({
    include: profileWithInfo.include,
    orderBy: [{ playback: { updatedAt: 'desc' } }, { name: 'asc' }],
    where: { user: { NOT: { id }, revoked: false } },
  });

  return users;
};

export const getQueueableUsers = async (id: string | null = null) => {
  if (id) {
    return prisma.profile.findMany({
      orderBy: { name: 'asc' },
      select: {
        followers: {
          where: { followingId: id },
        },
        image: true,
        name: true,
        settings: { select: { allowQueue: true } },
        userId: true,
      },
      where: { user: { NOT: { id }, revoked: false } },
    });
  } else {
    return prisma.profile.findMany({
      orderBy: { name: 'asc' },
      select: {
        image: true,
        name: true,
        settings: { select: { allowQueue: true } },
        userId: true,
      },
      where: { user: { revoked: false } },
    });
  }
};

// export const getFriends = async (userId?: string) => {
//   if (!userId) return null;
//   const friends = await prisma.friend.findMany({
//     orderBy: [{ friend: { playback: { updatedAt: 'desc' } } }],
//     select: {
//       friend: {
//         select: {
//           bio: true,
//           image: true,
//           name: true,
//           playback: {
//             include: {
//               track: trackWithInfo,
//             },
//           },
//           settings: { select: { allowQueue: true } },
//           userId: true,
//         },
//       },
//     },
//     where: { userId },
//   });
//   return friends;
// };

export const getFavorites = async (userId?: string) => {
  if (!userId) return null;

  const favorites = await prisma.favorite.findMany({
    select: {
      favorite: {
        select: {
          bio: true,
          image: true,
          name: true,
          playback: {
            include: {
              track: trackWithInfo,
            },
          },
          settings: { select: { allowQueue: true } },
          userId: true,
        },
      },
    },
    where: { userId },
  });
  return favorites;
};
