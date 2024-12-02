import SpotifyWebApi from "spotify-web-api-node";
import invariant from "tiny-invariant";

import { transformTracks } from "./prisma/spotify.server";
import { getUser, updateToken } from "./prisma/users.server";

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error("Missing SPOTIFY_CLIENT_ID env");
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing SPOTIFY_CLIENT_SECRET env");
}

if (!process.env.SPOTIFY_CALLBACK_URL) {
  throw new Error("Missing SPOTIFY_CALLBACK_URL env");
}
const redirectUri = process.env.SPOTIFY_CALLBACK_URL;
export const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri,
});

declare global {
  var __registeredSpotifyClients: Record<string, SpotifyWebApi> | undefined;
}

const registeredSpotifyClients =
  global.__registeredSpotifyClients || (global.__registeredSpotifyClients = {});

const createSpotifyClient = () => {
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri,
  });
};

export const getSpotifyClient = async (id: string) => {
  const data = await getUser(id);

  let spotifyClient: SpotifyWebApi;
  if (registeredSpotifyClients[id]) {
    spotifyClient = registeredSpotifyClients[id];
  } else {
    spotifyClient = createSpotifyClient();
    registeredSpotifyClients[id] = spotifyClient;
  }

  if (!data || !data.user) return { spotify: null, user: null };
  spotifyClient.setAccessToken(data.accessToken);

  const now = new Date();
  const isExpired = new Date(Number(data.expiresAt)) < now;
  let newToken = data.accessToken;
  if (isExpired) {
    console.log("Access Token expired");
    spotifyClient.setRefreshToken(data.refreshToken);
    const { body } = await spotifyClient.refreshAccessToken();
    spotifyClient.setAccessToken(body.access_token);
    newToken = body.access_token;

    const expiresAt = Date.now() + body.expires_in * 1000;
    await updateToken(
      data.user.userId,
      body.access_token,
      expiresAt,
      body.refresh_token,
    );
  }

  return { spotify: spotifyClient, token: newToken, user: data.user };
};

export const getUserSpotify = async (id: string) => {
  const instance = await getSpotifyClient(id).catch(async (e) => {
    if (e instanceof Error && e.message.includes("revoked")) {
      throw new Response("User Access Revoked", { status: 401 });
    }
    throw new Response("Failed to load Spotify", { status: 500 });
  });

  if (!instance || !instance.spotify) {
    throw new Response("Failed to load Spotify [2]", { status: 500 });
  }
  return instance;
};

export const getSavedStatus = async (id: string, trackId: string) => {
  const { token } = await getSpotifyClient(id);
  invariant(token, "missing token");

  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const data = await response.json();

  return data;
};

export const getUserSpotifyPlaylists = async (userId: string) => {
  const { spotify } = await getUserSpotify(userId);

  return spotify
    .getUserPlaylists(userId, { limit: 50 })
    .then((res) =>
      res.body.items.filter((data) => data.public && data.owner.id === userId),
    )
    .catch(() => []);
};

export const getUserSpotifyTop = async (userId: string, url: URL) => {
  const range = (url.searchParams.get("top-filter") || "medium_term") as
    | "medium_term"
    | "long_term"
    | "short_term";

  const { spotify } = await getUserSpotify(userId);
  const top = await spotify
    .getMyTopTracks({ limit: 50, time_range: range })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(top.map((track) => track));
};
