import type {
  Playback,
  Prisma,
  Profile,
  Settings,
  Track,
} from "@prisma/client";
import { prisma } from "../db.server";
import { profileWithInfo, trackWithInfo } from "./tracks.server";

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
  // @todo create scraper for user
  return newUser;
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    include: { user: true },
    where: { id },
  });
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
  console.log(
    "updatedToken -> expires at:",
    new Date(Number(data.expiresAt)).toLocaleTimeString("en-US"),
  );
  return data.expiresAt;
};

export const updateUserImage = async (id: string, image: string) => {
  const data = await prisma.profile.update({
    data: { image },
    where: { userId: id },
  });
  return data;
};

export const updateUserName = async (id: string, name: string) => {
  const data = await prisma.profile.update({
    data: { name },
    where: { userId: id },
  });
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
    throw new Response("Not found", { status: 404 });

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
  const users = await prisma.profile.findMany({
    include: profileWithInfo.include,
    orderBy: [{ playback: { updatedAt: "desc" } }, { name: "asc" }],
    where: { user: { NOT: { id }, revoked: false } },
  });

  return users;
};

export const getQueueableUsers = async (id: string | null = null) => {
  if (id) {
    return prisma.profile.findMany({
      orderBy: { name: "asc" },
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
  }
  return prisma.profile.findMany({
    orderBy: { name: "asc" },
    select: {
      image: true,
      name: true,
      settings: { select: { allowQueue: true } },
      userId: true,
    },
    where: { user: { revoked: false } },
  });
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
