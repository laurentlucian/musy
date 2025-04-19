import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.root.tsx", [
    index("routes/leaderboard.tsx"),
    route("new", "routes/new.tsx"),
    route("listening", "routes/listening.tsx"),
    route("account", "routes/account.tsx", [
      route(":provider", "routes/account.provider.tsx", [
        route("liked", "routes/account.provider.liked.tsx"),
        route("recent", "routes/account.provider.recent.tsx"),
        route("playlist", "routes/account.provider.playlist.tsx"),
      ]),

      ...prefix("admin", [
        route("transfers", "routes/admin/transfers.tsx"),
        route("syncs", "routes/admin/syncs.tsx"),
      ]),
    ]),
  ]),
  route("track/:trackId", "routes/track.tsx"),

  route(":rest", "routes/404.tsx"),

  route("actions/:action", "routes/resources/actions.ts"),
  route("api/auth/:provider/callback", "routes/resources/authenticate.ts"),
  route("api/onboarding", "routes/resources/onboarding.ts"),
] satisfies RouteConfig;
