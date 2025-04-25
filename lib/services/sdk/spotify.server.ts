import { env } from "@lib/env.server";
import { getProvider, updateToken } from "@lib/services/db/users.server";
import { log } from "@lib/utils";
import SpotifyWebApi from "spotify-web-api-node";

const config = {
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_CALLBACK_URL,
};

type GetSpotifyClientOptions = { userId: string } | { token: string };

export async function getSpotifyClient(args: GetSpotifyClientOptions) {
  if ("token" in args) {
    return new SpotifyWebApi({
      ...config,
      accessToken: args.token,
    });
  }

  const provider = await getProvider({
    userId: args.userId,
    type: "spotify",
  });

  if (!provider) throw new Error("No Spotify provider found for user");

  const client = new SpotifyWebApi({
    ...config,
    accessToken: provider.accessToken,
    refreshToken: provider.refreshToken,
  });

  // check if token needs refresh
  const buffer = 60 * 1000; // 60 seconds buffer
  const now = Date.now();
  const expiresAt = Number(provider.expiresAt);

  if (expiresAt && expiresAt > now + buffer) {
    return client;
  }

  try {
    log(`refreshing token for ${args.userId}`, "spotify");
    const { body } = await client.refreshAccessToken();

    const newAccessToken = body.access_token;
    const newRefreshToken = body.refresh_token ?? provider.refreshToken;
    const newExpiresAt = Date.now() + body.expires_in * 1000;

    await updateToken({
      id: args.userId,
      token: newAccessToken,
      expiresAt: newExpiresAt,
      refreshToken: newRefreshToken,
      type: "spotify",
    });

    client.setAccessToken(newAccessToken);
    client.setRefreshToken(newRefreshToken);

    return client;
  } catch (error) {
    log(`error: token refresh failed for ${args.userId}: ${error}`, "spotify");
    throw error;
  }
}
