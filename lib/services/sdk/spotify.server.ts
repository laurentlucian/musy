import { getProvider, updateToken } from "@lib/services/db/users.server";
import { log } from "@lib/utils";
import SpotifyWebApi from "spotify-web-api-node";

type Tokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

type Config = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type SpotifyInstance = {
  client: SpotifyWebApi;
  tokens: Tokens;
  userId: string;
  config: Config;
};

const instances: Map<string, SpotifyInstance> = new Map();
const refreshes: Map<string, Promise<void>> = new Map(); // prevent multiple token refreshes at once for same instance

const config: Config = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_CALLBACK_URL,
};

type GetSpotifyClientOptions = {
  userId?: string;
  token?: string;
} & ({ userId: string } | { token: string });

export async function getSpotifyClient({
  userId,
  token,
}: GetSpotifyClientOptions) {
  if (token) {
    return new SpotifyWebApi({
      ...config,
      accessToken: token,
    });
  }

  if (instances.has(userId)) {
    const instance = instances.get(userId)!;
    await refreshTokenIfNeeded({ instance });
    return instance.client;
  }

  const provider = await getProvider({
    userId,
    type: "spotify",
  });

  if (!provider) throw new Error("No Spotify provider found for user");

  const client = new SpotifyWebApi({
    ...config,
    accessToken: provider.accessToken,
    refreshToken: provider.refreshToken,
  });

  const instance = {
    client,
    tokens: {
      accessToken: provider.accessToken,
      refreshToken: provider.refreshToken,
      expiresAt: Number(provider.expiresAt),
    },
    userId,
    config,
  };

  instances.set(userId, instance);

  await refreshTokenIfNeeded({ instance });

  return client;
}

async function refreshTokenIfNeeded({
  instance,
}: {
  instance: SpotifyInstance;
}) {
  const { client, tokens: tokenInfo, userId } = instance;
  const now = Date.now();

  const buffer = 60 * 1000; // 60 seconds buffer
  if (tokenInfo.expiresAt > now + buffer) {
    return;
  }

  let refreshPromise = refreshes.get(userId);
  if (refreshPromise) return refreshPromise;

  const performRefresh = async () => {
    try {
      log(`refreshing token for ${userId}`, "spotify");
      const { body } = await client.refreshAccessToken();
      const newAccessToken = body.access_token;
      // Persist the refresh token if the API returned a new one, otherwise keep the old one
      const newRefreshToken = body.refresh_token ?? tokenInfo.refreshToken;
      const newExpiresAt = Date.now() + body.expires_in * 1000;

      // Update the client instance immediately with the new token
      client.setAccessToken(newAccessToken);
      if (body.refresh_token) {
        // Also update the refresh token on the client if a new one was provided
        client.setRefreshToken(newRefreshToken);
      }

      // Update the cached token information in our instances map
      instance.tokens = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      };

      // Trigger the database update asynchronously (fire and forget style)
      // We don't await this here to resolve the main promise faster.
      log(`storing new token for ${userId} in background`, "spotify");
      updateToken({
        id: userId,
        token: newAccessToken,
        expiresAt: newExpiresAt,
        refreshToken: newRefreshToken,
        type: "spotify",
      })
        .then(() => {
          log(`token refreshed and stored for ${userId}`, "spotify");
        })
        .catch((dbError) => {
          log(
            `error: failed to store refreshed token for ${userId} in db: ${dbError}`,
            "spotify",
          );
          // Consider adding more robust error handling/retry logic for DB updates if needed
        });

      // The promise resolves now, allowing waiting callers to proceed with the updated client/token info
    } catch (error) {
      log(`error: token refresh failed for ${userId}: ${error}`, "spotify");
      // Ensure the error is thrown so awaiting callers are notified of failure
      throw error;
    } finally {
      refreshes.delete(userId);
    }
  };

  refreshPromise = performRefresh();

  refreshes.set(userId, refreshPromise);

  return refreshPromise;
}
