import { env } from "cloudflare:workers";
import { log } from "~/components/utils";
import { createSpotifyClient, SpotifyApiError } from "~/lib.server/sdk/spotify";
import {
  getProvider,
  revokeUser,
  updateToken,
} from "~/lib.server/services/db/users";

type GetSpotifyClientOptions = { userId: string } | { token: string };

// Type alias for backward compatibility with existing code
export type Spotified = ReturnType<typeof createSpotifyClient>;

export async function getSpotifyClient(args: GetSpotifyClientOptions) {
  if ("token" in args) {
    if (!args.token) throw new Error("No Spotify token provided");

    return createSpotifyClient({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      accessToken: args.token,
    });
  }

  const provider = await getProvider({
    userId: args.userId,
    type: "spotify",
  });

  if (!provider) throw new Error("No Spotify provider found for user");

  // check if token needs refresh
  const buffer = 60 * 1000; // 60 seconds buffer
  const now = Date.now();
  const expiresAt = Number(provider.expiresAt);

  if (expiresAt && expiresAt > now + buffer) {
    return createSpotifyClient({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      accessToken: provider.accessToken,
    });
  }

  try {
    log(`refreshing token for ${args.userId}`, "spotify");

    const spotify = createSpotifyClient({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      accessToken: provider.accessToken,
    });

    const response = await spotify.auth.AuthorizationCode.refreshAccessToken(
      provider.refreshToken,
    );

    const newAccessToken = response.access_token;
    const newRefreshToken = response.refresh_token ?? provider.refreshToken;
    const newExpiresAt = Date.now() + response.expires_in * 1000;

    await updateToken({
      id: args.userId,
      token: newAccessToken,
      expiresAt: newExpiresAt,
      refreshToken: newRefreshToken,
      type: "spotify",
    });

    return createSpotifyClient({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      accessToken: newAccessToken,
    });
  } catch (error) {
    log(`token refresh failed for ${args.userId}: ${error}`, "spotify");
    if (error instanceof SpotifyApiError) {
      log(`spotify error: ${error.message}`, "spotify");
      if (
        error.message.includes("Revoked") ||
        error.message.includes("invalid_grant")
      ) {
        await revokeUser(args.userId, "spotify");
      }
    }
    throw error;
  }
}
