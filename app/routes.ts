import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("track/:trackId", "routes/track.tsx"),
  route("api/auth/:provider/callback", "routes/api/authenticate.ts"),
  route("account", "routes/account.tsx"),
] satisfies RouteConfig;
