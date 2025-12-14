import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.root.tsx", [
    index("routes/index.tsx"),

    route("profile/:userId?", "routes/profile/profile.tsx", [
      index("routes/profile/profile.index.tsx"),
      route("liked", "routes/profile/profile.liked.tsx"),
      route("recent", "routes/profile/profile.recent.tsx"),
    ]),

    route("settings", "routes/settings.tsx", [
      ...prefix("admin", [
        route("transfers", "routes/admin/transfers.tsx"),
        route("syncs", "routes/admin/syncs.tsx"),
        route("scripts", "routes/admin/scripts.tsx"),
        route("users", "routes/admin/users.tsx"),
        route("tracks", "routes/admin/tracks.tsx"),
      ]),
    ]),
  ]),
  route("track/:trackId", "routes/track.tsx"),

  route("actions/:action", "routes/resources/actions.ts"),
  route("api/auth/:provider/callback", "routes/resources/authenticate.ts"),
] satisfies RouteConfig;
