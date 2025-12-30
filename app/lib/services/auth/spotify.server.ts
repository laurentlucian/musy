import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { profile, provider, user } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { generateId } from "~/lib/services/utils.server";

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

      const existingProvider = await db.query.provider.findFirst({
        where: and(
          eq(provider.accountId, data.id),
          eq(provider.type, "spotify"),
        ),
      });

      const providerData = {
        type: "spotify" as const,
        accountId: data.id,
        accessToken: tokens.accessToken(),
        refreshToken: tokens.refreshToken(),
        expiresAt: Number(
          Date.now() + tokens.accessTokenExpiresInSeconds() * 1000,
        ),
        tokenType: tokens.tokenType(),
        revoked: "0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingProvider) {
        await db
          .update(provider)
          .set({
            ...providerData,
            createdAt: existingProvider.createdAt,
          })
          .where(
            and(eq(provider.accountId, data.id), eq(provider.type, "spotify")),
          );

        return { id: existingProvider.userId };
      }

      // Create new user and profile
      const userId = generateId();
      const now = new Date().toISOString();

      await db.transaction(async (tx) => {
        // Create user
        await tx.insert(user).values({
          id: userId,
          createdAt: now,
          updatedAt: now,
        });

        // Create profile
        await tx.insert(profile).values({
          id: userId,
          email: data.email!,
          image: data.images?.[0]?.url,
          name: data.display_name,
          createdAt: now,
          updatedAt: now,
        });

        // Create provider
        await tx.insert(provider).values({
          ...providerData,
          userId,
        });
      });

      return { id: userId };
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
