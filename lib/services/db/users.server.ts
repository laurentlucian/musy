import { prisma } from "@lib/services/db.server";
import { log } from "@lib/utils";

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
  log(
    `updatedToken -> expires at: ${new Date(Number(data.expiresAt)).toLocaleTimeString("en-US")}`,
    "spotify:service",
  );
  return data.expiresAt;
}

export async function updateUserImage(id: string, image: string) {
  const data = await prisma.profile.update({
    data: { image },
    where: { id },
  });
  return data;
}

export async function updateUserName(id: string, name: string) {
  const data = await prisma.profile.update({
    data: { name },
    where: { id },
  });
  return data;
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
