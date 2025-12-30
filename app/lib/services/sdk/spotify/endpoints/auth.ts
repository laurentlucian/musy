import { betterFetch } from "@better-fetch/fetch";
import type { OAuth2AccessTokenResponse } from "../types";

export interface RefreshTokenConfig {
  clientId: string;
  clientSecret: string;
}

/**
 * Refresh Spotify access token using refresh token
 * Throws raw better-fetch errors directly
 */
export async function refreshAccessToken(
  config: RefreshTokenConfig,
  refreshToken: string,
): Promise<OAuth2AccessTokenResponse> {
  const { clientId, clientSecret } = config;

  // Spotify uses basic auth for token refresh
  const credentials = btoa(`${clientId}:${clientSecret}`);

  // Build form-encoded body
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }).toString();

  const { data, error } = await betterFetch<OAuth2AccessTokenResponse>(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body,
    },
  );

  if (error) {
    // Throw raw better-fetch error directly
    throw error;
  }

  if (!data) {
    throw new Error("Response body is empty");
  }

  return data;
}
