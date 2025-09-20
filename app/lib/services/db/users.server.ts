import { prisma } from "~/lib/services/db.server";

export async function getProvider(args: {
  userId: string;
  type: "spotify" | "google";
}) {
  const data = await prisma.provider.findUnique({
    where: { userId_type: args },
  });
  return data;
}

export type Providers = ReturnType<typeof getProviders>;
export async function getProviders(userId: string) {
  return prisma.provider.findMany({
    where: { userId },
    select: { type: true },
  });
}

export async function updateToken(args: {
  id: string;
  token: string;
  expiresAt: number;
  refreshToken?: string;
  type: "spotify" | "google";
}) {
  const { id, token, expiresAt, refreshToken, type } = args;
  const data = await prisma.provider.update({
    data: { accessToken: token, expiresAt, refreshToken, revoked: false },
    where: { userId_type: { userId: id, type } },
  });
  return data.expiresAt;
}

export async function getAllUsersId() {
  return prisma.user
    .findMany({
      select: {
        id: true,
      },
      where: {
        providers: {
          some: {
            revoked: false,
          },
        },
      },
    })
    .then((users) => users.map((u) => u.id));
}

export async function revokeUser(
  userId: string,
  provider: "spotify" | "google",
) {
  await prisma.provider.update({
    where: { userId_type: { userId, type: provider } },
    data: { revoked: true },
  });
}

export async function deleteUser(userId: string) {
  await Promise.all([
    prisma.provider.deleteMany({ where: { userId } }),
    prisma.likedSongs.deleteMany({ where: { userId } }),
    prisma.recentSongs.deleteMany({ where: { userId } }),
    prisma.recommended.deleteMany({ where: { userId } }),
    prisma.playback.deleteMany({ where: { userId } }),
    prisma.playbackHistory.deleteMany({ where: { userId } }),
    prisma.playlistTrack.deleteMany({ where: { playlist: { userId } } }),
    prisma.feed.deleteMany({ where: { userId } }),
    prisma.thanks.deleteMany({ where: { userId } }),
    prisma.topSongs.deleteMany({ where: { userId } }),
    prisma.topArtists.deleteMany({ where: { userId } }),
    prisma.follow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    }),
    prisma.generatedPlaylist.deleteMany({
      where: {
        owner: {
          userId,
        },
      },
    }),
  ]);

  await Promise.all([
    prisma.generated.deleteMany({ where: { userId } }),
    prisma.top.deleteMany({ where: { userId } }),
    prisma.playlist.deleteMany({ where: { userId } }),
  ]);

  await prisma.profile.delete({ where: { id: userId } });
  await prisma.user.delete({ where: { id: userId } });
}
