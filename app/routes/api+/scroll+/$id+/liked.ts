import type { LoaderFunctionArgs } from "@remix-run/server-runtime";

import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

import { getSpotifyClient } from "~/services/spotify.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = params.id;
  console.log("userId", userId);

  if (typeof userId !== "string") {
    return typedjson("Request Error");
  }

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset")) || 0;

  const { spotify } = await getSpotifyClient(userId);
  invariant(spotify, "Missing spotify");
  const { body } = await spotify.getMySavedTracks({ limit: 50, offset });
  const data = body.items ?? [];
  return typedjson(data);
};

export default () => null;
