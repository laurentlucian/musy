import { betterFetch } from "@better-fetch/fetch";

export interface SpotifyFetchOptions {
  token: string;
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Wrapper around better-fetch for Spotify API calls with type safety
 * Throws raw better-fetch errors directly
 */
export async function spotifyFetch<T>(
  url: string,
  options: SpotifyFetchOptions,
): Promise<T> {
  const { token, method = "GET", body, query } = options;

  // Build URL with query parameters
  let fullUrl = url;
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (body && method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const { data, error } = await betterFetch<T>(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (error) {
    // Throw raw better-fetch error directly
    throw error;
  }

  // Handle empty responses (204 No Content)
  if (data === undefined || data === null) {
    // For DELETE/PUT requests, empty response is OK
    if (method === "DELETE" || method === "PUT") {
      return {} as T;
    }

    // Throw a simple error for empty responses
    throw new Error("Response body is empty");
  }

  return data;
}
