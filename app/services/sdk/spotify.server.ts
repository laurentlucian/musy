import SpotifyWebApi from "spotify-web-api-node";
import invariant from "tiny-invariant";
import { getProvider, updateToken } from "../prisma/users.server";
import type { BaseService, ServiceConfig, TokenInfo } from "./base.server";

export class SpotifyService implements BaseService<SpotifyWebApi> {
  private static instances: Map<string, SpotifyService> = new Map();
  private client: SpotifyWebApi;
  private userId?: string;
  private tokenInfo?: TokenInfo;

  private constructor(
    private readonly config: ServiceConfig,
    tokenInfo?: TokenInfo,
    userId?: string,
  ) {
    this.client = new SpotifyWebApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });

    if (tokenInfo) {
      this.tokenInfo = tokenInfo;
      this.client.setAccessToken(tokenInfo.accessToken);
      if (tokenInfo.refreshToken) {
        this.client.setRefreshToken(tokenInfo.refreshToken);
      }
    }

    this.userId = userId;
  }

  static async createFromUserId(userId: string): Promise<SpotifyService> {
    const provider = await getProvider({
      accountId: userId,
      type: "spotify",
    });

    if (!provider) {
      throw new Error("No Spotify provider found for user");
    }

    invariant(process.env.SPOTIFY_CLIENT_ID, "Missing SPOTIFY_CLIENT_ID env");
    invariant(
      process.env.SPOTIFY_CLIENT_SECRET,
      "Missing SPOTIFY_CLIENT_SECRET env",
    );
    invariant(
      process.env.SPOTIFY_CALLBACK_URL,
      "Missing SPOTIFY_CALLBACK_URL env",
    );

    const config = {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_CALLBACK_URL,
    };

    const instanceKey = `user:${userId}`;
    if (SpotifyService.instances.has(instanceKey)) {
      return SpotifyService.instances.get(instanceKey)!;
    }

    const instance = new SpotifyService(
      config,
      {
        accessToken: provider.accessToken,
        refreshToken: provider.refreshToken,
        expiresAt: Number(provider.expiresAt),
      },
      userId,
    );

    SpotifyService.instances.set(instanceKey, instance);
    return instance;
  }

  static createFromToken(
    accessToken: string,
    config?: Partial<ServiceConfig>,
  ): SpotifyService {
    invariant(process.env.SPOTIFY_CLIENT_ID, "missing SPOTIFY_CLIENT_ID env");
    invariant(
      process.env.SPOTIFY_CLIENT_SECRET,
      "missing SPOTIFY_CLIENT_SECRET env",
    );
    invariant(
      process.env.SPOTIFY_CALLBACK_URL,
      "missing SPOTIFY_CALLBACK_URL env",
    );

    const fullConfig = {
      clientId: config?.clientId ?? process.env.SPOTIFY_CLIENT_ID,
      clientSecret: config?.clientSecret ?? process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: config?.redirectUri ?? process.env.SPOTIFY_CALLBACK_URL,
    };

    const instanceKey = `token:${accessToken}`;
    if (SpotifyService.instances.has(instanceKey)) {
      return SpotifyService.instances.get(instanceKey)!;
    }

    const instance = new SpotifyService(fullConfig, { accessToken });
    SpotifyService.instances.set(instanceKey, instance);
    return instance;
  }

  async refreshTokenIfNeeded(): Promise<void> {
    if (!this.tokenInfo?.expiresAt || !this.userId) return;

    const now = Date.now();
    if (this.tokenInfo.expiresAt > now) return;

    const { body } = await this.client.refreshAccessToken();
    this.client.setAccessToken(body.access_token);

    const newTokenInfo = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    };

    this.tokenInfo = newTokenInfo;

    if (this.userId) {
      await updateToken({
        id: this.userId,
        token: body.access_token,
        expiresAt: newTokenInfo.expiresAt,
        refreshToken: body.refresh_token,
        type: "spotify",
      });
    }
  }

  getClient(): SpotifyWebApi {
    return this.client;
  }
}
