import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.root.tsx", [
    index("routes/create.tsx"),
    route("playlists", "routes/playlists.tsx"),
    route("trending", "routes/leaderboard.tsx"),
    route("new", "routes/new.tsx"),
    route("listening", "routes/listening.tsx"),
    route("playlists/:id", "routes/playlist.tsx"),

    route("profile/:userId?", "routes/profile.tsx", [
      route("liked", "routes/profile.liked.tsx"),
      route("recent", "routes/profile.recent.tsx"),
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
  route("api/onboarding", "routes/resources/onboarding.ts"),
  route("api/stats/:userId", "routes/resources/stats.ts"),
] satisfies RouteConfig;
