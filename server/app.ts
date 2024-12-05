import "react-router";
import Headers from "@mjackson/headers";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { initializeCronerMachine } from "~/services/scheduler/machine.server";
import { type SessionTyped, sessionStorage } from "~/services/session.server";

declare module "react-router" {
  interface AppLoadContext {
    userId?: string;
    session?: SessionTyped;
  }
}

export const app = express();

initializeCronerMachine();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    async getLoadContext({ headers }) {
      // @ts-expect-error - no types for IncomingHttpHeaders but works
      const h = new Headers(headers);
      const cookie = h.get("cookie");
      if (!cookie) return {};

      const session = await sessionStorage.getSession(cookie);
      const data = session.get("data");
      if (!data) return {};

      const userId = data.id;
      return {
        userId,
        session,
      };
    },
  }),
);
