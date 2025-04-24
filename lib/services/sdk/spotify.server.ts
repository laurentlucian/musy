import { env } from "@lib/env.server";
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

  const userId = args.userId;
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
  if (tokenInfo.expiresAt && tokenInfo.expiresAt > now + buffer) {
    return;
  }

  let refreshPromise = refreshes.get(userId);
  if (refreshPromise) return refreshPromise;

  const performRefresh = async () => {
    try {
      log(`refreshing token for ${userId}`, "spotify");
      const { body } = await client.refreshAccessToken();
      const newAccessToken = body.access_token;
      const newRefreshToken = body.refresh_token ?? tokenInfo.refreshToken;
      const newExpiresAt = Date.now() + body.expires_in * 1000;

      client.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        client.setRefreshToken(newRefreshToken);
      }

      instance.tokens = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      };

      log(`storing new token for ${userId}`, "spotify");
      await updateToken({
        id: userId,
        token: newAccessToken,
        expiresAt: newExpiresAt,
        refreshToken: newRefreshToken,
        type: "spotify",
      });
    } catch (error) {
      log(`error: token refresh failed for ${userId}: ${error}`, "spotify");
      throw error;
    } finally {
      refreshes.delete(userId);
    }
  };

  refreshPromise = performRefresh();

  refreshes.set(userId, refreshPromise);

  return refreshPromise;
}
