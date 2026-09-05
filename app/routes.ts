import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  layout("routes/layout.root.tsx", [
    route("profile/:userId?", "routes/profile/profile.tsx", [
      index("routes/profile/overview.tsx"),
      route("repeating", "routes/profile/repeating.tsx"),
      route("history", "routes/profile/history.tsx"),
      route("liked", "routes/profile/liked.tsx"),
      route("playlists", "routes/profile/playlists.tsx", [
        route(":playlistId", "routes/profile/playlist.tsx"),
      ]),
    ]),
    route("explore", "routes/explore.tsx"),
    route("import", "routes/import.tsx"),
    route("settings", "routes/settings.tsx", [
      ...prefix("admin", [
        route("syncs", "routes/admin/syncs.tsx"),
        route("scripts", "routes/admin/scripts.tsx"),
        route("users", "routes/admin/users.tsx"),
        route("counts", "routes/admin/counts.tsx"),
      ]),
    ]),
    route("queue", "routes/queue/groups.tsx", [
      route(":groupId", "routes/queue/group.tsx"),
    ]),
    route("track/:trackId", "routes/track/track.tsx"),
    route("artist/:artistId", "routes/track/artist.tsx"),
    route("album/:albumId", "routes/track/album.tsx"),
  ]),

  route("resources/history-import", "routes/resources/history-import.ts"),
  route("resources/import", "routes/resources/import.ts"),
  route("actions/:action", "routes/resources/actions.ts"),
  route("api/auth/:provider/callback", "routes/resources/authenticate.ts"),
  route(".well-known/*", "routes/resources/well-known.ts"),
] satisfies RouteConfig;
