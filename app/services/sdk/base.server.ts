export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface ServiceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface BaseService<T, C = T> {
  getClient(): C;
}
