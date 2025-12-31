import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  foreignKey,
  index,
  integer,
  numeric,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const playback = sqliteTable(
  "Playback",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    trackId: text()
      .notNull()
      .references(() => track.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    timestamp: integer().default(0).notNull(),
    progress: integer().notNull(),
  },
  (table) => [uniqueIndex("Playback_userId_key").on(table.userId)],
);

export const user = sqliteTable("User", {
  id: text().primaryKey().notNull(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  newId: text(),
});

export const profile = sqliteTable(
  "Profile",
  {
    id: text()
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    name: text(),
    bio: text(),
    email: text().notNull(),
    image: text(),
  },
  (table) => [uniqueIndex("Profile_email_key").on(table.email)],
);

export const recentSongs = sqliteTable(
  "RecentSongs",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    playedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    trackId: text()
      .notNull()
      .references(() => track.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    action: text().default("recent").notNull(),
    sessionId: integer(),
  },
  (table) => [
    uniqueIndex("RecentSongs_playedAt_userId_key").on(
      table.playedAt,
      table.userId,
    ),
  ],
);

export const track = sqliteTable(
  "Track",
  {
    id: text().primaryKey().notNull(),
    uri: text().notNull(),
    name: text().notNull(),
    image: text().notNull(),
    albumUri: text().notNull(),
    albumName: text().notNull(),
    artist: text().notNull(),
    artistUri: text().notNull(),
    explicit: numeric().notNull(),
    previewUrl: text("preview_url"),
    link: text().notNull(),
    duration: integer().notNull(),
    provider: text().default("spotify").notNull(),
  },
  (table) => [uniqueIndex("Track_id_key").on(table.id)],
);

export const playlist = sqliteTable(
  "Playlist",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    uri: text().notNull(),
    image: text().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    total: integer().default(0).notNull(),
    provider: text().default("spotify").notNull(),
    snapshotId: text("snapshot_id"),
  },
  (table) => [uniqueIndex("Playlist_id_key").on(table.id)],
);

export const sync = sqliteTable(
  "Sync",
  {
    userId: text().notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().notNull(),
    state: text().notNull(),
    type: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.state, table.type],
      name: "Sync_userId_state_type_pk",
    }),
  ],
);

export const topSongsToTrack = sqliteTable(
  "_TopSongsToTrack",
  {
    a: text("A")
      .notNull()
      .references(() => topSongs.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    b: text("B")
      .notNull()
      .references(() => track.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    index("TopSongsToTrack_B_idx").on(table.b),
    uniqueIndex("_TopSongsToTrack_AB_unique").on(table.a, table.b),
  ],
);

export const artist = sqliteTable("Artist", {
  id: text().primaryKey().notNull(),
  uri: text().notNull(),
  name: text().notNull(),
  image: text().notNull(),
  popularity: integer().notNull(),
  followers: integer().notNull(),
  genres: text().notNull(),
});

export const album = sqliteTable("Album", {
  id: text().primaryKey().notNull(),
  uri: text().notNull(),
  type: text().notNull(),
  total: text().notNull(),
  image: text().notNull(),
  name: text().notNull(),
  date: text().notNull(),
  artistId: text()
    .notNull()
    .references(() => artist.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const top = sqliteTable(
  "Top",
  {
    userId: text()
      .primaryKey()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [uniqueIndex("Top_userId_key").on(table.userId)],
);

export const topArtists = sqliteTable(
  "TopArtists",
  {
    id: text().primaryKey().notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    type: text().notNull(),
    artistIds: text().notNull(),
    userId: text()
      .notNull()
      .references(() => top.userId, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [uniqueIndex("TopArtists_id_key").on(table.id)],
);

export const artistToTopArtists = sqliteTable(
  "_ArtistToTopArtists",
  {
    a: text("A")
      .notNull()
      .references(() => artist.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    b: text("B")
      .notNull()
      .references(() => topArtists.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    index("ArtistToTopArtists_B_idx").on(table.b),
    uniqueIndex("_ArtistToTopArtists_AB_unique").on(table.a, table.b),
  ],
);

export const topSongs = sqliteTable(
  "TopSongs",
  {
    id: text().primaryKey().notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    type: text().notNull(),
    trackIds: text().notNull(),
    userId: text()
      .notNull()
      .references(() => top.userId, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [uniqueIndex("TopSongs_id_key").on(table.id)],
);

export const provider = sqliteTable(
  "Provider",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    type: text().notNull(),
    accountId: text().notNull(),
    accessToken: text().notNull(),
    refreshToken: text().notNull(),
    expiresAt: integer().notNull(),
    tokenType: text().notNull(),
    revoked: numeric().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  },
  (table) => [
    uniqueIndex("Provider_userId_type_key").on(table.userId, table.type),
    uniqueIndex("Provider_accountId_type_key").on(table.accountId, table.type),
  ],
);

export const playlistTrack = sqliteTable(
  "PlaylistTrack",
  {
    addedAt: numeric().notNull(),
    playlistId: text()
      .notNull()
      .references(() => playlist.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    trackId: text()
      .notNull()
      .references(() => track.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("PlaylistTrack_playlistId_trackId_key").on(
      table.playlistId,
      table.trackId,
    ),
  ],
);

export const likedSongs = sqliteTable(
  "LikedSongs",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    trackId: text()
      .notNull()
      .references(() => track.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    action: text().default("liked").notNull(),
  },
  (table) => [
    uniqueIndex("LikedSongs_trackId_userId_key").on(
      table.trackId,
      table.userId,
    ),
  ],
);

export const playbackHistory = sqliteTable("PlaybackHistory", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  startedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  endedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text()
    .notNull()
    .references(() => profile.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});
