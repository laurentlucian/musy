import { relations } from "drizzle-orm/relations";
import {
  album,
  artist,
  artistToTopArtists,
  likedSongs,
  playback,
  playbackHistory,
  playlist,
  playlistTrack,
  profile,
  provider,
  recentSongs,
  top,
  topArtists,
  topSongs,
  topSongsToTrack,
  track,
  user,
} from "./schema";

export const playbackRelations = relations(playback, ({ one }) => ({
  track: one(track, {
    fields: [playback.trackId],
    references: [track.id],
  }),
  profile: one(profile, {
    fields: [playback.userId],
    references: [profile.id],
  }),
}));

export const trackRelations = relations(track, ({ many }) => ({
  playbacks: many(playback),
  recentSongs: many(recentSongs),
  topSongsToTracks: many(topSongsToTrack),
  playlistTracks: many(playlistTrack),
  likedSongs: many(likedSongs),
}));

export const profileRelations = relations(profile, ({ one, many }) => ({
  playbacks: many(playback),
  user: one(user, {
    fields: [profile.id],
    references: [user.id],
  }),
  recentSongs: many(recentSongs),
  playlists: many(playlist),
  tops: many(top),
  likedSongs: many(likedSongs),
  playbackHistories: many(playbackHistory),
}));

export const userRelations = relations(user, ({ many }) => ({
  profiles: many(profile),
  providers: many(provider),
}));

export const recentSongsRelations = relations(recentSongs, ({ one }) => ({
  profile: one(profile, {
    fields: [recentSongs.userId],
    references: [profile.id],
  }),
  track: one(track, {
    fields: [recentSongs.trackId],
    references: [track.id],
  }),
}));

export const playlistRelations = relations(playlist, ({ one, many }) => ({
  profile: one(profile, {
    fields: [playlist.userId],
    references: [profile.id],
  }),
  playlistTracks: many(playlistTrack),
}));

export const topSongsToTrackRelations = relations(
  topSongsToTrack,
  ({ one }) => ({
    track: one(track, {
      fields: [topSongsToTrack.b],
      references: [track.id],
    }),
    topSong: one(topSongs, {
      fields: [topSongsToTrack.a],
      references: [topSongs.id],
    }),
  }),
);

export const topSongsRelations = relations(topSongs, ({ one, many }) => ({
  topSongsToTracks: many(topSongsToTrack),
  top: one(top, {
    fields: [topSongs.userId],
    references: [top.userId],
  }),
}));

export const albumRelations = relations(album, ({ one }) => ({
  artist: one(artist, {
    fields: [album.artistId],
    references: [artist.id],
  }),
}));

export const artistRelations = relations(artist, ({ many }) => ({
  albums: many(album),
  artistToTopArtists: many(artistToTopArtists),
}));

export const topRelations = relations(top, ({ one, many }) => ({
  profile: one(profile, {
    fields: [top.userId],
    references: [profile.id],
  }),
  topArtists: many(topArtists),
  topSongs: many(topSongs),
}));

export const topArtistsRelations = relations(topArtists, ({ one, many }) => ({
  top: one(top, {
    fields: [topArtists.userId],
    references: [top.userId],
  }),
  artistToTopArtists: many(artistToTopArtists),
}));

export const artistToTopArtistsRelations = relations(
  artistToTopArtists,
  ({ one }) => ({
    topArtist: one(topArtists, {
      fields: [artistToTopArtists.b],
      references: [topArtists.id],
    }),
    artist: one(artist, {
      fields: [artistToTopArtists.a],
      references: [artist.id],
    }),
  }),
);

export const providerRelations = relations(provider, ({ one }) => ({
  user: one(user, {
    fields: [provider.userId],
    references: [user.id],
  }),
}));

export const playlistTrackRelations = relations(playlistTrack, ({ one }) => ({
  track: one(track, {
    fields: [playlistTrack.trackId],
    references: [track.id],
  }),
  playlist: one(playlist, {
    fields: [playlistTrack.playlistId],
    references: [playlist.id],
  }),
}));

export const likedSongsRelations = relations(likedSongs, ({ one }) => ({
  profile: one(profile, {
    fields: [likedSongs.userId],
    references: [profile.id],
  }),
  track: one(track, {
    fields: [likedSongs.trackId],
    references: [track.id],
  }),
}));

export const playbackHistoryRelations = relations(
  playbackHistory,
  ({ one }) => ({
    profile: one(profile, {
      fields: [playbackHistory.userId],
      references: [profile.id],
    }),
  }),
);
