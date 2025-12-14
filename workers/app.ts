import { createRequestHandler, RouterContextProvider } from "react-router";

const handler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    return handler(request, new RouterContextProvider());
  },
} satisfies ExportedHandler<Env>;
