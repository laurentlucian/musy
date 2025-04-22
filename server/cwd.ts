// @todo make it work on prod to replace start.sh; errors with module not found
import { execSync } from "node:child_process";

export async function generatePrisma() {
  console.log("\x1b[36m%s\x1b[0m", "generating prisma");
  try {
    execSync("bun prisma migrate dev", { stdio: "inherit" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
