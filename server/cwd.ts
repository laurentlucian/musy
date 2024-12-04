// @todo make it work on prod to replace start.sh; errors with module not found
import { execSync } from "node:child_process";
import { logError } from "~/lib/utils";

export async function generatePrisma() {
  console.log("\x1b[36m%s\x1b[0m", "migrating/generating prisma");
  try {
    execSync("bunx prisma migrate dev", { stdio: "inherit" });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}
