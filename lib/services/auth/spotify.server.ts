import { env } from "@lib/env.server";
import { type Prisma, prisma } from "@lib/services/db.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { generateId } from "@lib/utils.server";
import { OAuth2Strategy } from "remix-auth-oauth2";

const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
const redirectURI = env.SPOTIFY_CALLBACK_URL;

export function getSpotifyStrategy() {
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
      const spotify = await getSpotifyClient({ token: tokens.accessToken() });

      const data = await spotify.user.getCurrentUserProfile();

      const provider = await prisma.provider.findUnique({
        where: {
          accountId_type: {
            accountId: data.id,
            type: "spotify",
          },
        },
        select: { userId: true },
      });

      const PROVIDER_DATA: Prisma.ProviderCreateWithoutUserInput = {
        type: "spotify",
        accountId: data.id,
        accessToken: tokens.accessToken(),
        refreshToken: tokens.refreshToken(),
        expiresAt: BigInt(
          Date.now() + tokens.accessTokenExpiresInSeconds() * 1000,
        ),
        tokenType: tokens.tokenType(),
        revoked: false,
      };

      if (provider) {
        await prisma.provider.update({
          where: {
            accountId_type: {
              accountId: data.id,
              type: "spotify",
            },
          },
          data: PROVIDER_DATA,
        });

        return { id: provider.userId };
      }

      const profile = await prisma.profile.upsert({
        where: { email: data.email },
        update: {
          image: data.images?.[0]?.url,
          name: data.display_name,
          user: {
            upsert: {
              where: { id: data.id },
              update: {
                providers: {
                  create: PROVIDER_DATA,
                },
              },
              create: {
                id: generateId(),
                providers: {
                  create: PROVIDER_DATA,
                },
              },
            },
          },
        },
        create: {
          email: data.email,
          image: data.images?.[0]?.url,
          name: data.display_name,
          user: {
            create: {
              id: generateId(),
              providers: {
                create: PROVIDER_DATA,
              },
            },
          },
        },
        select: { user: { select: { id: true } } },
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
