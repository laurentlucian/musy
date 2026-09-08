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
    username: text(),
    email: text().notNull(),
    image: text(),
  },
  (table) => [
    uniqueIndex("Profile_email_key").on(table.email),
    uniqueIndex("Profile_username_key").on(table.username),
  ],
);

export const historyEvent = sqliteTable(
  "HistoryEvent",
  {
    id: text().primaryKey().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    batchId: text().notNull(),
    trackId: text().notNull(),
    trackName: text().notNull(),
    artistName: text().notNull(),
    albumName: text().notNull(),
    playedAt: text().notNull(),
    msPlayed: integer().notNull(),
    ip: text(),
    platform: text(),
    country: text(),
    rawJson: text().notNull(),
    archiveKey: text(),
    archiveChecksum: text(),
    archiveOffset: integer(),
    normalizationVersion: integer().notNull().default(1),
    source: text().notNull().default("spotify-history"),
  },
  (table) => [
    index("HistoryEvent_user_date_idx").on(table.userId, table.playedAt),
    index("HistoryEvent_batch_idx").on(table.batchId),
    index("HistoryEvent_userId_ip_idx").on(table.userId, table.ip),
    index("HistoryEvent_user_cursor_idx").on(
      table.userId,
      sql`${table.playedAt} DESC`,
      sql`${table.id} DESC`,
    ),
    index("HistoryEvent_user_country_cursor_idx").on(
      table.userId,
      sql`UPPER(TRIM(${table.country}))`,
      sql`${table.playedAt} DESC`,
      sql`${table.id} DESC`,
    ),
    index("HistoryEvent_identity_idx").on(
      table.userId,
      table.trackId,
      table.playedAt,
      table.msPlayed,
      table.platform,
    ),
    index("HistoryEvent_unarchived_idx")
      .on(table.userId, table.id)
      .where(sql`${table.archiveKey} IS NULL`),
  ],
);

export const historyImport = sqliteTable("HistoryImport", {
  statsYear: integer().default(-1),
  statsUpdatedAt: integer().notNull().default(0),
  userId: text()
    .primaryKey()
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  jobId: text().notNull(),
  status: text().notNull(),
  updatedAt: integer().notNull(),
});

export const historyExploreSummary = sqliteTable(
  "HistoryExploreSummary",
  {
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    kind: text().notNull(),
    value: text().notNull(),
    listens: integer().notNull(),
    msPlayed: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.kind, table.value] })],
);

export const analyticsYear = sqliteTable(
  "AnalyticsYear",
  {
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    year: integer().notNull(),
    revision: integer().notNull().default(1),
    publishedRevision: integer().notNull().default(0),
    updatedAt: integer().notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.year] })],
);

export const archiveCleanup = sqliteTable("ArchiveCleanup", {
  userId: text().primaryKey().notNull(),
  retryAt: integer().notNull(),
});

export const dashboardSnapshot = sqliteTable(
  "DashboardSnapshot",
  {
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    year: integer().notNull(),
    sourceRevision: text().notNull(),
    payload: text().notNull(),
    updatedAt: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.year] })],
);

export const dashboardMetadataRevision = sqliteTable(
  "DashboardMetadataRevision",
  {
    id: integer().primaryKey(),
    revision: integer().notNull(),
  },
);

export const dashboardUserRevision = sqliteTable("DashboardUserRevision", {
  userId: text()
    .primaryKey()
    .references(() => profile.id, { onDelete: "cascade" }),
  revision: integer().notNull().default(1),
});

export const listeningTrackSummary = sqliteTable(
  "ListeningTrackSummary",
  {
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    year: integer().notNull(),
    trackId: text().notNull(),
    archiveArtist: text().notNull(),
    archiveAlbum: text().notNull(),
    plays: integer().notNull(),
    milliseconds: integer().notNull(),
    estimatedPlays: integer().notNull(),
    unknownPlays: integer().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.userId,
        table.year,
        table.trackId,
        table.archiveArtist,
        table.archiveAlbum,
      ],
    }),
  ],
);

export const listeningDaySummary = sqliteTable(
  "ListeningDaySummary",
  {
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    year: integer().notNull(),
    day: text().notNull(),
    hour: text().notNull(),
    plays: integer().notNull(),
    milliseconds: integer().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.year, table.day, table.hour] }),
  ],
);

export const historyImportBatch = sqliteTable(
  "HistoryImportBatch",
  {
    payloadHash: text().notNull(),
    archiveKey: text(),
    archiveChecksum: text(),
    id: text().primaryKey().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    jobId: text().notNull(),
    imported: integer().notNull(),
    duplicates: integer().notNull(),
    skipped: integer().notNull(),
  },
  (table) => [
    index("HistoryImportBatch_user_job_idx").on(table.userId, table.jobId),
  ],
);

export const recentTracks = sqliteTable(
  "RecentTracks",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    historyEventId: text().references(() => historyEvent.id),
    msPlayed: integer(),
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
  },
  (table) => [
    index("RecentTracks_userId_playedAt_idx").on(table.userId, table.playedAt),
    uniqueIndex("RecentTracks_playedAt_userId_key")
      .on(table.playedAt, table.userId, table.trackId)
      .where(sql`${table.historyEventId} IS NULL`),
    uniqueIndex("RecentTracks_historyEventId_key").on(table.historyEventId),
    index("RecentTracks_trackId_analytics_idx").on(table.trackId, table.userId),
    index("RecentTracks_user_utc_year_idx").on(
      table.userId,
      sql`CAST(strftime('%Y',${table.playedAt}) AS INTEGER)`,
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
    explicit: numeric().notNull(),
    previewUrl: text("preview_url"),
    link: text().notNull(),
    duration: integer().notNull(),
    provider: text().default("spotify").notNull(),
    metadataSource: text().notNull().default("provider"),
    albumId: text().references(() => album.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
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

export const topTracksToTrack = sqliteTable(
  "_TopTracksToTrack",
  {
    a: text("A")
      .notNull()
      .references(() => topTracks.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    b: text("B")
      .notNull()
      .references(() => track.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    index("TopTracksToTrack_B_idx").on(table.b),
    uniqueIndex("_TopTracksToTrack_AB_unique").on(table.a, table.b),
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
  metadataSource: text().notNull().default("provider"),
});

export const album = sqliteTable("Album", {
  id: text().primaryKey().notNull(),
  uri: text().notNull(),
  type: text().notNull(),
  total: text().notNull(),
  image: text().notNull(),
  name: text().notNull(),
  date: text().notNull(),
  popularity: integer().notNull(),
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

export const topTracks = sqliteTable(
  "TopTracks",
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
  (table) => [uniqueIndex("TopTracks_id_key").on(table.id)],
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

export const likedTracks = sqliteTable(
  "LikedTracks",
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
    uniqueIndex("LikedTracks_trackId_userId_key").on(
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

export const trackToArtist = sqliteTable(
  "_TrackToArtist",
  {
    trackId: text("trackId")
      .notNull()
      .references(() => track.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    artistId: text("artistId")
      .notNull()
      .references(() => artist.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    index("TrackToArtist_artistId_idx").on(table.artistId),
    uniqueIndex("_TrackToArtist_trackId_artistId_unique").on(
      table.trackId,
      table.artistId,
    ),
  ],
);

export const stats = sqliteTable(
  "Stats",
  {
    id: text().primaryKey().notNull(),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    year: integer().notNull(),
    played: integer().default(0).notNull(),
    liked: integer().default(0).notNull(),
    minutes: numeric().default("0").notNull(),
    trackName: text(),
    trackId: text(),
    artistId: text(),
    albumId: text(),
    trackCount: integer().default(0).notNull(),
    artist: text(),
    album: text(),
    createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: numeric().notNull(),
  },
  (table) => [
    uniqueIndex("Stats_userId_year_key").on(table.userId, table.year),
  ],
);

export const queueGroup = sqliteTable("QueueGroup", {
  id: text().primaryKey().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),

  name: text(),
  userId: text()
    .notNull()
    .references(() => profile.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});

export const queueGroupToUser = sqliteTable(
  "_QueueGroupToUser",
  {
    groupId: text()
      .notNull()
      .references(() => queueGroup.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("_QueueGroupToUser_userId_groupId_key").on(
      table.userId,
      table.groupId,
    ),
    index("_QueueGroupToUser_userId_idx").on(table.userId),
  ],
);

export const queueItem = sqliteTable(
  "QueueItem",
  {
    id: text().primaryKey().notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),

    groupId: text()
      .notNull()
      .references(() => queueGroup.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
  },
  (table) => [index("QueueItem_groupId_idx").on(table.groupId)],
);

export const queueItemDelivery = sqliteTable(
  "_QueueItemDelivery",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),

    queueItemId: text()
      .notNull()
      .references(() => queueItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text()
      .notNull()
      .references(() => profile.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    reaction: text(), // like, dislike, null
  },
  (table) => [
    index("_QueueItemDelivery_userId_idx").on(table.userId),
    uniqueIndex("_QueueItemDelivery_queueItemId_userId_key").on(
      table.queueItemId,
      table.userId,
    ),
  ],
);

export const initialImport = sqliteTable("InitialImport", {
  userId: text()
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text({ enum: ["queued", "running", "failed", "complete"] })
    .notNull()
    .default("queued"),
  stage: text({ enum: ["recent", "top", "liked", "stats"] })
    .notNull()
    .default("recent"),
  imported: integer().notNull().default(0),
  total: integer(),
  offset: integer().notNull().default(0),
  year: integer(),
  attempts: integer().notNull().default(0),
  updatedAt: integer().notNull(),
  lease: text(),
  retryAt: integer().notNull().default(0),
});

export const geoIp = sqliteTable("GeoIP", {
  ip: text().primaryKey().notNull(),
  latitude: numeric(),
  longitude: numeric(),
  city: text(),
  region: text(),
  country: text(),
  status: text().notNull(),
  updatedAt: integer().notNull(),
});

export const historyGeoJob = sqliteTable("HistoryGeoJob", {
  userId: text()
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text().notNull().default("queued"),
  updatedAt: integer().notNull(),
  retryAt: integer().notNull().default(0),
  attempts: integer().notNull().default(0),
  lease: text(),
  error: text(),
});
