export interface SpotifyApiErrorProps {
  status: number;
  statusText: string;
  endpoint: string;
  requestParams?: any;
  details?: any;
  retryAfter?: number;
}

export class SpotifyApiError extends Error implements SpotifyApiErrorProps {
  status: number;
  statusText: string;
  endpoint: string;
  requestParams?: any;
  details?: any;
  retryAfter?: number;

  constructor(
    status: number,
    statusText: string,
    endpoint: string,
    requestParams?: any,
    details?: any,
    retryAfter?: number,
  ) {
    super(
      details?.error_description ||
        details?.error ||
        `Spotify API error: ${status} ${statusText}`,
    );
    this.name = "SpotifyApiError";
    this.status = status;
    this.statusText = statusText;
    this.endpoint = endpoint;
    this.requestParams = requestParams;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}
