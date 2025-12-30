import { spotifyFetch } from "../fetch";
import type {
  ArtistsUsersType,
  CurrentUserProfile,
  TopItemsOptionalParams,
  UsersTopItems,
  UsersTopItemsType,
} from "../types";

/**
 * Get current user's profile
 */
export async function getUserProfile(
  token: string,
): Promise<CurrentUserProfile> {
  return spotifyFetch<CurrentUserProfile>("https://api.spotify.com/v1/me", {
    token,
  });
}

/**
 * Get user's top items (tracks or artists)
 */
export async function getUserTopItems(
  token: string,
  type: UsersTopItemsType,
  options?: TopItemsOptionalParams,
): Promise<UsersTopItems> {
  const query: Record<string, string | number | undefined> = {};
  if (options?.limit) query.limit = options.limit;
  if (options?.offset) query.offset = options.offset;
  if (options?.time_range) query.time_range = options.time_range;

  return spotifyFetch<UsersTopItems>(
    `https://api.spotify.com/v1/me/top/${type}`,
    {
      token,
      query,
    },
  );
}

/**
 * Check if user follows artists or users
 */
export async function checkIfUserFollowsArtistsOrUsers(
  token: string,
  type: ArtistsUsersType,
  ids: string[],
): Promise<boolean[]> {
  const query: Record<string, string> = {
    type,
    ids: ids.join(","),
  };

  return spotifyFetch<boolean[]>(
    "https://api.spotify.com/v1/me/following/contains",
    {
      token,
      query,
    },
  );
}
