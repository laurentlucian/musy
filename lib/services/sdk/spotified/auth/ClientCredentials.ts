import { ReadWriteBaseClient } from "../client/ReadWriteBaseClient.js";
import type RequestMaker from "../client-helpers/RequestMaker.js";
import { API_TOKEN_URL } from "../constants.js";
import type {
  ClientCredentialsFlowResponse,
  OAuth2Credentials,
} from "../types/index.js";
import { encodeStringToBase64 } from "../utils.js";

export class ClientCredentials extends ReadWriteBaseClient {
  protected clientId?: string;

  protected clientSecret?: string;

  constructor(credentials: OAuth2Credentials, requestMaker: RequestMaker) {
    super(requestMaker);
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  async requestAccessToken() {
    if (this.clientSecret === undefined) {
      throw new Error("Client secret is required for requesting authorization");
    }

    const accessTokenResult = await this.post<ClientCredentialsFlowResponse>(
      API_TOKEN_URL,
      {
        grant_type: "client_credentials",
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

export default ClientCredentials;
