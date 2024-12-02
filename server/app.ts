import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { initCron } from "~/services/scheduler/croner.server";

declare module "react-router" {
  interface AppLoadContext {
    context: null;
  }
}

export const app = express();

void initCron();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        context: null,
      };
    },
  }),
);
