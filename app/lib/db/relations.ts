import { relations } from "drizzle-orm/relations";
import { feed, playlistTrack, playlist, track, profile, generated, follow, likedSongs, playback, playbackHistory, recommended, user, provider, recentSongs, thanks, generatedPlaylist, generatedPlaylistToTrack, topSongsToTrack, topSongs, artist, album, top, topArtists, artistToTopArtists } from "./schema";

export const playlistTrackRelations = relations(playlistTrack, ({one}) => ({
	feed: one(feed, {
		fields: [playlistTrack.feedId],
		references: [feed.id]
	}),
	playlist: one(playlist, {
		fields: [playlistTrack.playlistId],
		references: [playlist.id]
	}),
	track: one(track, {
		fields: [playlistTrack.trackId],
		references: [track.id]
	}),
}));

export const feedRelations = relations(feed, ({one, many}) => ({
	playlistTracks: many(playlistTrack),
	profile: one(profile, {
		fields: [feed.userId],
		references: [profile.id]
	}),
	likedSongs: many(likedSongs),
	playbackHistories: many(playbackHistory),
	recommendeds: many(recommended),
}));

export const playlistRelations = relations(playlist, ({one, many}) => ({
	playlistTracks: many(playlistTrack),
	profile: one(profile, {
		fields: [playlist.userId],
		references: [profile.id]
	}),
}));

export const trackRelations = relations(track, ({many}) => ({
	playlistTracks: many(playlistTrack),
	likedSongs: many(likedSongs),
	playbacks: many(playback),
	recommendeds: many(recommended),
	recentSongs: many(recentSongs),
	thanks: many(thanks),
	generatedPlaylistToTracks: many(generatedPlaylistToTrack),
	topSongsToTracks: many(topSongsToTrack),
}));

export const generatedRelations = relations(generated, ({one, many}) => ({
	profile: one(profile, {
		fields: [generated.userId],
		references: [profile.id]
	}),
	generatedPlaylists: many(generatedPlaylist),
}));

export const profileRelations = relations(profile, ({one, many}) => ({
	generateds: many(generated),
	feeds: many(feed),
	follows_followerId: many(follow, {
		relationName: "follow_followerId_profile_id"
	}),
	follows_followingId: many(follow, {
		relationName: "follow_followingId_profile_id"
	}),
	likedSongs: many(likedSongs),
	playbacks: many(playback),
	playbackHistories: many(playbackHistory),
	recommendeds: many(recommended),
	user: one(user, {
		fields: [profile.id],
		references: [user.id]
	}),
	recentSongs: many(recentSongs),
	thanks: many(thanks),
	playlists: many(playlist),
	tops: many(top),
}));

export const followRelations = relations(follow, ({one}) => ({
	profile_followerId: one(profile, {
		fields: [follow.followerId],
		references: [profile.id],
		relationName: "follow_followerId_profile_id"
	}),
	profile_followingId: one(profile, {
		fields: [follow.followingId],
		references: [profile.id],
		relationName: "follow_followingId_profile_id"
	}),
}));

export const likedSongsRelations = relations(likedSongs, ({one}) => ({
	feed: one(feed, {
		fields: [likedSongs.feedId],
		references: [feed.id]
	}),
	profile: one(profile, {
		fields: [likedSongs.userId],
		references: [profile.id]
	}),
	track: one(track, {
		fields: [likedSongs.trackId],
		references: [track.id]
	}),
}));

export const playbackRelations = relations(playback, ({one}) => ({
	track: one(track, {
		fields: [playback.trackId],
		references: [track.id]
	}),
	profile: one(profile, {
		fields: [playback.userId],
		references: [profile.id]
	}),
}));

export const playbackHistoryRelations = relations(playbackHistory, ({one}) => ({
	feed: one(feed, {
		fields: [playbackHistory.feedId],
		references: [feed.id]
	}),
	profile: one(profile, {
		fields: [playbackHistory.userId],
		references: [profile.id]
	}),
}));

export const recommendedRelations = relations(recommended, ({one}) => ({
	feed: one(feed, {
		fields: [recommended.feedId],
		references: [feed.id]
	}),
	profile: one(profile, {
		fields: [recommended.userId],
		references: [profile.id]
	}),
	track: one(track, {
		fields: [recommended.trackId],
		references: [track.id]
	}),
}));

export const providerRelations = relations(provider, ({one}) => ({
	user: one(user, {
		fields: [provider.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	providers: many(provider),
	profiles: many(profile),
}));

export const recentSongsRelations = relations(recentSongs, ({one}) => ({
	profile: one(profile, {
		fields: [recentSongs.userId],
		references: [profile.id]
	}),
	track: one(track, {
		fields: [recentSongs.trackId],
		references: [track.id]
	}),
}));

export const thanksRelations = relations(thanks, ({one}) => ({
	profile: one(profile, {
		fields: [thanks.userId],
		references: [profile.id]
	}),
	track: one(track, {
		fields: [thanks.trackId],
		references: [track.id]
	}),
}));

export const generatedPlaylistRelations = relations(generatedPlaylist, ({one, many}) => ({
	generated: one(generated, {
		fields: [generatedPlaylist.ownerId],
		references: [generated.id]
	}),
	generatedPlaylistToTracks: many(generatedPlaylistToTrack),
}));

export const generatedPlaylistToTrackRelations = relations(generatedPlaylistToTrack, ({one}) => ({
	track: one(track, {
		fields: [generatedPlaylistToTrack.b],
		references: [track.id]
	}),
	generatedPlaylist: one(generatedPlaylist, {
		fields: [generatedPlaylistToTrack.a],
		references: [generatedPlaylist.id]
	}),
}));

export const topSongsToTrackRelations = relations(topSongsToTrack, ({one}) => ({
	track: one(track, {
		fields: [topSongsToTrack.b],
		references: [track.id]
	}),
	topSong: one(topSongs, {
		fields: [topSongsToTrack.a],
		references: [topSongs.id]
	}),
}));

export const topSongsRelations = relations(topSongs, ({one, many}) => ({
	topSongsToTracks: many(topSongsToTrack),
	top: one(top, {
		fields: [topSongs.userId],
		references: [top.userId]
	}),
}));

export const albumRelations = relations(album, ({one}) => ({
	artist: one(artist, {
		fields: [album.artistId],
		references: [artist.id]
	}),
}));

export const artistRelations = relations(artist, ({many}) => ({
	albums: many(album),
	artistToTopArtists: many(artistToTopArtists),
}));

export const topRelations = relations(top, ({one, many}) => ({
	profile: one(profile, {
		fields: [top.userId],
		references: [profile.id]
	}),
	topArtists: many(topArtists),
	topSongs: many(topSongs),
}));

export const topArtistsRelations = relations(topArtists, ({one, many}) => ({
	top: one(top, {
		fields: [topArtists.userId],
		references: [top.userId]
	}),
	artistToTopArtists: many(artistToTopArtists),
}));

export const artistToTopArtistsRelations = relations(artistToTopArtists, ({one}) => ({
	topArtist: one(topArtists, {
		fields: [artistToTopArtists.b],
		references: [topArtists.id]
	}),
	artist: one(artist, {
		fields: [artistToTopArtists.a],
		references: [artist.id]
	}),
}));