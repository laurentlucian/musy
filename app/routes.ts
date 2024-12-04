import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("account", "routes/account.tsx", [
      route(":provider", "routes/account.provider.tsx", [
        route("liked", "routes/account.provider.liked.tsx"),
        route("recent", "routes/account.provider.recent.tsx"),
      ]),
    ]),
  ]),
  route("track/:trackId", "routes/track.tsx"),

  route("actions/:action", "routes/actions.tsx"),
  route("api/auth/:provider/callback", "routes/api/authenticate.ts"),
] satisfies RouteConfig;
