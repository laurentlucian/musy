import { getProvider } from "@lib/services/db/users.server";
import type { BaseService, ServiceConfig } from "@lib/services/sdk/base.server";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import invariant from "tiny-invariant";

interface GoogleClients {
  youtube: ReturnType<typeof google.youtube>;
  oauth: ReturnType<typeof google.oauth2>;
  auth: OAuth2Client;
}

export class GoogleService
  implements BaseService<ReturnType<typeof google.youtube>, GoogleClients>
{
  private static instances: Map<string, GoogleService> = new Map();
  private youtube;
  private oauth;
  private auth;

  private constructor(
    private readonly config: ServiceConfig,
    credentials?: Credentials,
  ) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    if (credentials) {
      this.auth.setCredentials(credentials);
    }

    this.oauth = google.oauth2({ version: "v2", auth: this.auth });
    this.youtube = google.youtube({ version: "v3", auth: this.auth });
  }

  static async createFromCredentials(credentials: Credentials) {
    invariant(credentials?.access_token, "missing access token");
    invariant(process.env.GOOGLE_CLIENT_ID, "missing GOOGLE_CLIENT_ID env");
    invariant(
      process.env.GOOGLE_CLIENT_SECRET,
      "missing GOOGLE_CLIENT_SECRET env",
    );
    invariant(
      process.env.GOOGLE_CALLBACK_URL,
      "missing GOOGLE_CALLBACK_URL env",
    );

    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
    };

    const tempKey = `temp:${credentials.access_token}`;
    const instance = GoogleService.getInstance(tempKey, config, credentials);

    return instance;
  }

  static getInstance(
    instanceKey: string,
    config: ServiceConfig,
    credentials?: Credentials,
  ): GoogleService {
    if (!GoogleService.instances.has(instanceKey)) {
      const instance = new GoogleService(config, credentials);
      GoogleService.instances.set(instanceKey, instance);
    }

    const instance = GoogleService.instances.get(instanceKey)!;

    if (credentials) {
      instance.auth.setCredentials(credentials);
    }

    return instance;
  }

  static async createFromUserId(userId: string): Promise<GoogleService> {
    const provider = await getProvider({
      userId,
      type: "google",
    });

    if (!provider) {
      throw new Error("No Google provider found for user");
    }

    invariant(process.env.GOOGLE_CLIENT_ID, "missing GOOGLE_CLIENT_ID env");
    invariant(
      process.env.GOOGLE_CLIENT_SECRET,
      "missing GOOGLE_CLIENT_SECRET env",
    );
    invariant(
      process.env.GOOGLE_CALLBACK_URL,
      "missing GOOGLE_CALLBACK_URL env",
    );

    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
    };

    const instanceKey = `user:${userId}`;
    if (GoogleService.instances.has(instanceKey)) {
      return GoogleService.instances.get(instanceKey)!;
    }

    const instance = new GoogleService(config, {
      access_token: provider.accessToken,
      refresh_token: provider.refreshToken,
      expiry_date: Number(provider.expiresAt),
    });

    GoogleService.instances.set(instanceKey, instance);
    return instance;
  }

  getClient() {
    return {
      youtube: this.youtube,
      oauth: this.oauth,
      auth: this.auth,
    };
  }
}
