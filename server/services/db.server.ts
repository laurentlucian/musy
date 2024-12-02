import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton.server";

const prisma = singleton("prisma", () => {
  const client = new PrismaClient();
  client.$connect();
  return client;
});

export { prisma };
