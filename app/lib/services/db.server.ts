import "dotenv/config";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "~/generated/prisma/client/client";
import { singleton } from "~/lib/services/singleton.server";

const D1 = {
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
  CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
};

const prisma =
  process.env.NODE_ENV === "development"
    ? singleton("prisma", () => {
        const adapter = new PrismaD1(D1);
        return new PrismaClient({ adapter });
      })
    : new PrismaClient({
        adapter: new PrismaD1(D1),
      });

export { prisma };

export type * from "~/generated/prisma/client/client";
