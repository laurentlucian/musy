import { env } from "@lib/env.server";
import { getProvider, updateToken } from "@lib/services/db/users.server";
import Spotified from "@lib/services/sdk/spotified/client/Spotified";
import { log } from "@lib/utils";

type GetSpotifyClientOptions = { userId: string } | { token: string };

export async function getSpotifyClient(args: GetSpotifyClientOptions) {
  if ("token" in args) {
    const spotify = new Spotified({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    });
    spotify.setBearerToken(args.token);

    return spotify;
  }

  const spotify = new Spotified({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  const provider = await getProvider({
    userId: args.userId,
    type: "spotify",
  });

  if (!provider) throw new Error("No Spotify provider found for user");

  spotify.setBearerToken(provider.accessToken);

  // check if token needs refresh
  const buffer = 60 * 1000; // 60 seconds buffer
  const now = Date.now();
  const expiresAt = Number(provider.expiresAt);

  if (expiresAt && expiresAt > now + buffer) {
    return spotify;
  }

  try {
    log(`refreshing token for ${args.userId}`, "spotify");
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

    spotify.setBearerToken(newAccessToken);

    return spotify;
  } catch (error) {
    log(`error: token refresh failed for ${args.userId}: ${error}`, "spotify");
    throw error;
  }
}
