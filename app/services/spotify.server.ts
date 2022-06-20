import SpotifyWebApi from 'spotify-web-api-node';
import { getUser, updateToken } from './auth.server';

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('Missing SPOTIFY_CLIENT_ID env');
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing SPOTIFY_CLIENT_SECRET env');
}

if (!process.env.SPOTIFY_CALLBACK_URL) {
  throw new Error('Missing SPOTIFY_CALLBACK_URL env');
}

export const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_CALLBACK_URL,
});

export const spotifyApi = async (id: string) => {
  const data = await getUser(id);

  // @todo(type-fix) data.user should never be null if data exists
  if (!data || !data.user) return { spotify: null, user: null };
  spotifyClient.setAccessToken(data.accessToken);

  const now = new Date();
  const isExpired = new Date(data.expiresAt) < now;
  if (isExpired) {
    console.log('Access Token expired');
    spotifyClient.setRefreshToken(data.refreshToken);
    const { body } = await spotifyClient.refreshAccessToken();
    spotifyClient.setAccessToken(body.access_token);

    const expiresAt = Date.now() + body.expires_in * 1000;
    await updateToken(data.user.userId, body.access_token, expiresAt);
  }

  return { spotify: spotifyClient, user: data.user };
};
