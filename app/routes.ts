import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("track/:trackId", "routes/track.tsx"),
  route("api/auth/:provider/callback", "routes/api/authenticate.ts"),
  route("account", "routes/account.tsx", [
    route(":provider", "routes/account.provider.tsx", [
      route("liked", "routes/account.provider.liked.tsx"),
    ]),
  ]),
  route("actions/like", "routes/actions/like.tsx"),
] satisfies RouteConfig;
