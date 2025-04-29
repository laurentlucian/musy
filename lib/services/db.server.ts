import { env } from "@lib/env.server";
import { PrismaClient } from "@lib/services/db/generated.server";
import { singleton } from "@lib/services/singleton.server";

const prisma =
  env.NODE_ENV === "development"
    ? singleton("prisma", () => {
        const client = new PrismaClient();
        return client;
      })
    : new PrismaClient();

export { prisma };
export type * from "@lib/services/db/generated.server";
