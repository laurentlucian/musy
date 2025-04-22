import { PrismaClient } from "@lib/services/db/generated.server";
import { singleton } from "@lib/services/singleton.server";

const prisma = singleton("prisma", () => {
  const client = new PrismaClient();
  client.$connect();
  return client;
});

export { prisma };
export type * from "@lib/services/db/generated.server";
