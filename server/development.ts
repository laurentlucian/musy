import type { Express } from "./index.ts";

export async function development(app: Express) {
  console.log("\x1b[36m%s\x1b[0m", "initializing development");
  const { generatePrisma } = await import("./cwd.js");
  await generatePrisma();

  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("app/express.server.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
}
