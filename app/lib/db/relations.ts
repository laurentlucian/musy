import { relations } from "drizzle-orm/relations";
import {
  album,
  artist,
  artistToTopArtists,
  likedTracks,
  playback,
  playbackHistory,
  playlist,
  playlistTrack,
  profile,
  provider,
  recentTracks,
  top,
  topArtists,
  topTracks,
  topTracksToTrack,
  track,
  trackToArtist,
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

export const trackRelations = relations(track, ({ one, many }) => ({
  playbacks: many(playback),
  recentTracks: many(recentTracks),
  topTracksToTracks: many(topTracksToTrack),
  playlistTracks: many(playlistTrack),
  likedTracks: many(likedTracks),
  album: one(album, {
    fields: [track.albumId],
    references: [album.id],
  }),
  artists: many(trackToArtist),
}));

export const profileRelations = relations(profile, ({ one, many }) => ({
  playbacks: many(playback),
  user: one(user, {
    fields: [profile.id],
    references: [user.id],
  }),
  recentTracks: many(recentTracks),
  playlists: many(playlist),
  tops: many(top),
  likedTracks: many(likedTracks),
  playbackHistories: many(playbackHistory),
}));

export const userRelations = relations(user, ({ many }) => ({
  profiles: many(profile),
  providers: many(provider),
}));

export const recentTracksRelations = relations(recentTracks, ({ one }) => ({
  profile: one(profile, {
    fields: [recentTracks.userId],
    references: [profile.id],
  }),
  track: one(track, {
    fields: [recentTracks.trackId],
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

export const topTracksToTrackRelations = relations(
  topTracksToTrack,
  ({ one }) => ({
    track: one(track, {
      fields: [topTracksToTrack.b],
      references: [track.id],
    }),
    topTrack: one(topTracks, {
      fields: [topTracksToTrack.a],
      references: [topTracks.id],
    }),
  }),
);

export const topTracksRelations = relations(topTracks, ({ one, many }) => ({
  topTracksToTracks: many(topTracksToTrack),
  top: one(top, {
    fields: [topTracks.userId],
    references: [top.userId],
  }),
}));

export const albumRelations = relations(album, ({ one, many }) => ({
  artist: one(artist, {
    fields: [album.artistId],
    references: [artist.id],
  }),
  tracks: many(track),
}));

export const artistRelations = relations(artist, ({ many }) => ({
  albums: many(album),
  artistToTopArtists: many(artistToTopArtists),
  tracks: many(trackToArtist),
}));

export const topRelations = relations(top, ({ one, many }) => ({
  profile: one(profile, {
    fields: [top.userId],
    references: [profile.id],
  }),
  topArtists: many(topArtists),
  topTracks: many(topTracks),
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

export const likedTracksRelations = relations(likedTracks, ({ one }) => ({
  profile: one(profile, {
    fields: [likedTracks.userId],
    references: [profile.id],
  }),
  track: one(track, {
    fields: [likedTracks.trackId],
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

export const trackToArtistRelations = relations(trackToArtist, ({ one }) => ({
  track: one(track, {
    fields: [trackToArtist.trackId],
    references: [track.id],
  }),
  artist: one(artist, {
    fields: [trackToArtist.artistId],
    references: [artist.id],
  }),
}));
