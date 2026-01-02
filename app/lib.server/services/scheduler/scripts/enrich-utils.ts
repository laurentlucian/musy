import { env } from "cloudflare:workers";
import { log, logError } from "~/components/utils";
import { createSpotifyClient, SpotifyApiError } from "~/lib.server/sdk/spotify";
import {
  getAllUsersId,
  getProvider,
  updateToken,
} from "~/lib.server/services/db/users";

export function serializeError(error: unknown): string {
  if (error instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof SpotifyApiError) {
      errorObj.status = error.status;
      errorObj.retryAfter = error.retryAfter;
    }

    const errorWithCause = error as { cause?: unknown };
    if (errorWithCause.cause) {
      errorObj.cause = serializeError(errorWithCause.cause);
    }

    return JSON.stringify(errorObj, null, 2);
  }
  return JSON.stringify(error, null, 2);
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 280;
  private readonly windowMs = 30_000;

  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 100;
      if (waitTime > 0) {
        log(
          `rate limit: waiting ${Math.ceil(waitTime)}ms (${this.requests.length}/${this.maxRequests} requests in window)`,
          "enrich",
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requests = this.requests.filter(
          (timestamp) => Date.now() - timestamp < this.windowMs,
        );
      }
    }

    this.requests.push(Date.now());
  }
}

export async function getAccessToken(userId?: string): Promise<{
  token: string;
  userId: string;
}> {
  const users = await getAllUsersId();
  if (users.length === 0) {
    throw new Error("No users found for enrichment");
  }

  const targetUserId = userId || users[0];
  const provider = await getProvider({
    userId: targetUserId,
    type: "spotify",
  });

  if (!provider) {
    throw new Error("No Spotify provider found");
  }

  // check if token needs refresh
  const buffer = 60 * 1000; // 60 seconds buffer
  const now = Date.now();
  const expiresAt = Number(provider.expiresAt);

  if (expiresAt && expiresAt > now + buffer) {
    return { token: provider.accessToken, userId: targetUserId };
  }

  try {
    log(`refreshing token for ${targetUserId}`, "enrich");

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
      id: targetUserId,
      token: newAccessToken,
      expiresAt: newExpiresAt,
      refreshToken: newRefreshToken,
      type: "spotify",
    });

    log(`token refreshed successfully for ${targetUserId}`, "enrich");
    return { token: newAccessToken, userId: targetUserId };
  } catch (error) {
    logError(
      `token refresh failed for ${targetUserId}: ${serializeError(error)}`,
    );
    throw error;
  }
}
