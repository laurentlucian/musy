import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const prismaMigrations = sqliteTable("_prisma_migrations", {
  id: text().primaryKey().notNull(),
  checksum: text().notNull(),
  finishedAt: numeric("finished_at"),
  migrationName: text("migration_name").notNull(),
  logs: text(),
  rolledBackAt: numeric("rolled_back_at"),
  startedAt: numeric("started_at").default(sql`(current_timestamp)`).notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

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
    feedId: integer().references(() => feed.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    uniqueIndex("PlaylistTrack_playlistId_trackId_key").on(
      table.playlistId,
      table.trackId,
    ),
    uniqueIndex("PlaylistTrack_feedId_key").on(table.feedId),
  ],
);

export const generated = sqliteTable(
  "Generated",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    mood: text(),
    taste: text(),
  },
  (table) => [
    uniqueIndex("Generated_userId_key").on(table.userId),
    uniqueIndex("AI_userId_key").on(table.userId),
  ],
);

export const feed = sqliteTable(
  "Feed",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [index("Feed_createdAt_idx").on(table.createdAt)],
);

export const follow = sqliteTable(
  "Follow",
  {
    followingId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    followerId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.followingId, table.followerId],
      name: "Follow_followingId_followerId_pk",
    }),
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
    feedId: integer().references(() => feed.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    uniqueIndex("LikedSongs_trackId_userId_key").on(
      table.trackId,
      table.userId,
    ),
    uniqueIndex("LikedSongs_feedId_key").on(table.feedId),
  ],
);

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

export const playbackHistory = sqliteTable(
  "PlaybackHistory",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    startedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    endedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    feedId: integer().references(() => feed.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [uniqueIndex("PlaybackHistory_feedId_key").on(table.feedId)],
);

export const recommended = sqliteTable(
  "Recommended",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
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
    caption: text(),
    action: text().default("recommend").notNull(),
    feedId: integer().references(() => feed.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [uniqueIndex("Recommended_feedId_key").on(table.feedId)],
);

export const user = sqliteTable("User", {
  id: text().primaryKey().notNull(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  newId: text(),
});

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
    uniqueIndex("Provider_accountId_type_key").on(table.accountId, table.type),
    uniqueIndex("Provider_userId_type_key").on(table.userId, table.type),
  ],
);

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

export const thanks = sqliteTable("Thanks", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  trackId: text()
    .notNull()
    .references(() => track.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text().references(() => profile.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

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

export const transfer = sqliteTable(
  "Transfer",
  {
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().notNull(),
    userId: text().notNull(),
    state: text().notNull(),
    type: text().notNull(),
    source: text().notNull(),
    destination: text().notNull(),
    skip: integer().default(0).notNull(),
    total: integer().notNull(),
    nextAfter: numeric(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.type, table.source, table.destination],
      name: "Transfer_userId_type_source_destination_pk",
    }),
  ],
);

export const generatedPlaylist = sqliteTable(
  "GeneratedPlaylist",
  {
    id: text().primaryKey().notNull(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    mood: text().notNull(),
    year: integer().notNull(),
    ownerId: integer()
      .notNull()
      .references(() => generated.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    familiar: numeric(),
    popular: numeric(),
  },
  (table) => [
    uniqueIndex("GeneratedPlaylist_id_key").on(table.id),
    uniqueIndex("AIPlaylist_id_key").on(table.id),
  ],
);

export const generatedPlaylistToTrack = sqliteTable(
  "_GeneratedPlaylistToTrack",
  {
    a: text("A")
      .notNull()
      .references(() => generatedPlaylist.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    b: text("B")
      .notNull()
      .references(() => track.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    index("GeneratedPlaylistToTrack_B_idx").on(table.b),
    uniqueIndex("_GeneratedPlaylistToTrack_AB_unique").on(table.a, table.b),
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
