import { env } from "cloudflare:workers";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "~/lib/services/db/generated.server/client";
import { singleton } from "~/lib/services/singleton.server";

const prisma =
  env.NODE_ENV === "development"
    ? singleton("prisma", () => {
        const adapter = new PrismaD1(env.musy);
        return new PrismaClient({ adapter });
      })
    : new PrismaClient({ adapter: new PrismaD1(env.musy) });

export { prisma };

export type * from "~/lib/services/db/generated.server/client";
