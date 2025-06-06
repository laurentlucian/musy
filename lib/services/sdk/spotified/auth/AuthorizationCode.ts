import { ReadWriteBaseClient } from "../client/ReadWriteBaseClient.js";
import OAuth2Helper from "../client-helpers/OAuth2Helper.js";
import type RequestMaker from "../client-helpers/RequestMaker.js";
import { API_TOKEN_URL, AUTHORIZE_URL } from "../constants.js";
import type {
  AuthURLData,
  OAuth2AccessTokenArgs,
  OAuth2AccessTokenResponse,
  OAuth2AuthArgs,
  OAuth2Credentials,
} from "../types/index.js";
import { encodeStringToBase64 } from "../utils.js";

export class AuthorizationCode extends ReadWriteBaseClient {
  protected clientId?: string;

  protected clientSecret?: string;

  constructor(credentials: OAuth2Credentials, requestMaker: RequestMaker) {
    super(requestMaker);
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  generateAuthorizationURL(
    redirectUri: string,
    options: Partial<OAuth2AuthArgs> = {},
  ): AuthURLData {
    const state = options.state ?? OAuth2Helper.generateRandomString(64);
    const scope = options.scope ?? "";
    const showDialog = options.show_dialog ?? false;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId as string,
      redirect_uri: redirectUri,
      state,
    });

    if (showDialog) {
      params.append("show_dialog", showDialog.toString());
    }

    if (scope) {
      params.append("scope", Array.isArray(scope) ? scope.join(" ") : scope);
    }

    const url = `${AUTHORIZE_URL}?${params.toString()}`;

    return {
      url,
      state,
    };
  }

  async requestAccessToken({ code, redirectUri }: OAuth2AccessTokenArgs) {
    if (this.clientSecret === undefined) {
      throw new Error(
        "Client secret is required for requesting an access token",
      );
    }

    const accessTokenResult = await this.post<OAuth2AccessTokenResponse>(
      API_TOKEN_URL,
      {
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodeStringToBase64(`${this.clientId}:${this.clientSecret}`)}`,
        },
      },
    );

    return accessTokenResult;
  }

  async refreshAccessToken(refreshToken: string) {
    if (this.clientSecret === undefined) {
      throw new Error(
        "Client secret is required for requesting an access token",
      );
    }

    const accessTokenResult = await this.post<OAuth2AccessTokenResponse>(
      API_TOKEN_URL,
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodeStringToBase64(`${this.clientId}:${this.clientSecret}`)}`,
        },
      },
    );

    return accessTokenResult;
  }
}

export default AuthorizationCode;
