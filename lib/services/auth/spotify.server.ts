import { prisma } from "@lib/services/db.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { OAuth2Strategy } from "remix-auth-oauth2";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectURI = process.env.SPOTIFY_CALLBACK_URL;

export function getSpotifyStrategy() {
  if (!clientId || !clientSecret || !redirectURI)
    throw new Error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set");

  return new OAuth2Strategy(
    {
      clientId,
      clientSecret,
      redirectURI,
      authorizationEndpoint: "https://accounts.spotify.com/authorize",
      tokenEndpoint: "https://accounts.spotify.com/api/token",
      scopes,
      cookie: "spotify:session",
    },
    async ({ tokens }) => {
      const spotify = await SpotifyService.createFromToken(
        tokens.accessToken(),
      );
      const client = spotify.getClient();

      const response = await client.getMe();

      const data = response.body;

      const provider = await prisma.provider.findUnique({
        where: {
          accountId_type: {
            accountId: data.id,
            type: "spotify",
          },
        },
        select: { userId: true },
      });

      if (provider) return { id: provider.userId };

      let profile = await prisma.profile.findFirst({
        where: { email: data.email },
        select: { user: { select: { id: true } } },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            email: data.email,
            image: data.images?.[0]?.url,
            name: data.display_name,
            user: {
              create: {},
            },
          },
          select: { user: { select: { id: true } } },
        });
      }

      await prisma.provider.create({
        data: {
          type: "spotify",
          accountId: data.id,
          accessToken: tokens.accessToken(),
          refreshToken: tokens.refreshToken(),
          expiresAt: BigInt(
            Date.now() + tokens.accessTokenExpiresInSeconds() * 1000,
          ),
          tokenType: tokens.tokenType(),
          user: {
            connect: {
              id: profile.user.id,
            },
          },
        },
      });

      return { id: profile.user.id };
    },
  );
}

// https://developer.spotify.com/documentation/general/guides/authorization/scopes
const scopes = [
  // 'streaming', // (must have spotify premium) --> controls playback of tracks through a spotify player (might not need if we change direction with app (see user-modify-playback-state))
  "user-library-read", // checks if a user saved specific songs (can show music_senders/user if a user already likes a song they suggested/queued )
  "user-read-email", // user spotify profile
  "user-read-private", // search for albums, artists, playlists, tracks, shows or episodes
  "user-read-playback-state", // get currently playing track and info about it (important)
  "user-read-recently-played", // recently played (can show music_senders/user if a user already listened to a song they suggested/queued recently)
  "user-read-currently-playing", // currently playing track only (do we need this?)
  "user-modify-playback-state", // to add to queue (can replace 'streaming' scope so we can integrate our own player to include more than just spotify)
  "user-follow-modify", // used to (un)follow users/artists
  "user-library-modify", // used to save songs to user's library
  "playlist-modify-public", // create playlists with custom image
  "user-top-read", // get top tracks
  "user-follow-read", // allows to check users follows
];
