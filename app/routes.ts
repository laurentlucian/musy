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
      index("routes/profile/profile.stats.tsx"),
      route("top", "routes/profile/profile.top.tsx"),
      route("liked", "routes/profile/profile.liked.tsx"),
      route("listened", "routes/profile/profile.listened.tsx"),
      route("playlists", "routes/profile/profile.playlists.tsx", [
        route(
          ":playlistId",
          "routes/profile/profile.playlists.$playlistId.tsx",
        ),
      ]),
    ]),

    route("settings", "routes/settings.tsx", [
      ...prefix("admin", [
        route("syncs", "routes/admin/syncs.tsx"),
        route("scripts", "routes/admin/scripts.tsx"),
        route("users", "routes/admin/users.tsx"),
        route("counts", "routes/admin/counts.tsx"),
      ]),
    ]),
  ]),
  route("track/:trackId", "routes/track/track.tsx"),
  route("artist/:artistId", "routes/track/artist.tsx"),
  route("album/:albumId", "routes/track/album.tsx"),

  route("actions/:action", "routes/resources/actions.ts"),
  route("api/auth/:provider/callback", "routes/resources/authenticate.ts"),
  route(".well-known/*", "routes/resources/well-known.ts"),
] satisfies RouteConfig;
