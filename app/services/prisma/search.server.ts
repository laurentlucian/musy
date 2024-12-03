import { prisma } from "../db.server";

export async function getUsersByKeyword(keyword: string, userId: string) {
  return prisma.profile.findMany({
    where: { AND: { NOT: { id: userId } }, name: { contains: keyword } },
  });
}

export async function getTracksByKeyword(keyword: string) {
  return prisma.track.findMany({
    include: {
      liked: { orderBy: { createdAt: "asc" }, select: { user: true } },
      recent: {
        orderBy: { playedAt: "desc" },
        select: { user: true },
      },
    },
    orderBy: {
      recent: {
        _count: "desc",
      },
    },
    where: { name: { contains: keyword } },
  });
}
