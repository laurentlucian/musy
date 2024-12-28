import { getProvider, updateToken } from "@lib/services/db/users.server";
import type { ServiceConfig } from "@lib/services/sdk/base.server";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import invariant from "tiny-invariant";

export type GoogleClients = {
  youtube: ReturnType<typeof google.youtube>;
  oauth: ReturnType<typeof google.oauth2>;
  auth: OAuth2Client;
};

function getConfig() {
  invariant(process.env.GOOGLE_CLIENT_ID, "missing GOOGLE_CLIENT_ID env");
  invariant(
    process.env.GOOGLE_CLIENT_SECRET,
    "missing GOOGLE_CLIENT_SECRET env",
  );
  invariant(process.env.GOOGLE_CALLBACK_URL, "missing GOOGLE_CALLBACK_URL env");

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_CALLBACK_URL,
  };
}

function createGoogleAuth(config: ServiceConfig, credentials?: Credentials) {
  const auth = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri,
  );

  if (credentials) {
    auth.setCredentials(credentials);
  }

  return auth;
}

async function refreshAccessTokenIfNeeded(
  auth: OAuth2Client,
  credentials: Credentials,
  userId: string,
) {
  if (credentials.refresh_token && credentials.expiry_date) {
    const expiryDate = Number(credentials.expiry_date);
    console.log("token expiryDate", expiryDate);
    const fiveMinutes = 5 * 60 * 1000;

    if (Date.now() >= expiryDate - fiveMinutes) {
      const tokens = await auth.refreshAccessToken();
      auth.setCredentials(tokens.credentials);

      await updateToken({
        id: userId,
        token: tokens.credentials.access_token!,
        expiresAt: tokens.credentials.expiry_date!,
        refreshToken: tokens.credentials.refresh_token || undefined,
        type: "google",
      });
    }
  }
}

export function createGoogleClients(auth: OAuth2Client) {
  return {
    youtube: google.youtube({ version: "v3", auth }),
    oauth: google.oauth2({ version: "v2", auth }),
    auth,
  };
}

export async function getGoogleClientsFromUserId(userId: string) {
  const provider = await getProvider({ userId, type: "google" });
  if (!provider) {
    throw new Error("No Google provider found for user");
  }

  const config = getConfig();
  const credentials = {
    access_token: provider.accessToken,
    refresh_token: provider.refreshToken,
    expiry_date: Number(provider.expiresAt),
  };

  const auth = createGoogleAuth(config, credentials);
  await refreshAccessTokenIfNeeded(auth, credentials, userId);

  return createGoogleClients(auth);
}

export function getGoogleClientsFromCredentials(credentials: Credentials) {
  invariant(credentials.access_token, "missing access token");

  const config = getConfig();
  const auth = createGoogleAuth(config, credentials);

  return createGoogleClients(auth);
}
