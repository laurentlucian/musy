import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

const prisma = singleton("prisma", () => new PrismaClient());
void prisma.$connect();

export { prisma };
