import { $ } from "bun";
import express from "express";
import type { Express } from "./index.ts";

const BUILD_PATH = "../build/server/index.js";
export async function production(app: Express) {
  console.log("\x1b[36m%s\x1b[0m", "initializing production");
  await $`bun prisma migrate deploy`;

  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}
