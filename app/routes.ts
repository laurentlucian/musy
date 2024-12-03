import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("track/:trackId", "routes/track.tsx"),
] satisfies RouteConfig;
