import { singleton } from "@lib/services/singleton.server";
import { PrismaClient } from "@prisma/client";

const prisma = singleton("prisma", () => {
  const client = new PrismaClient();
  client.$connect();
  return client;
});

export { prisma };
