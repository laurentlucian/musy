import SpotifyWebApi from 'spotify-web-api-node';
import { spotifyStrategy } from './auth.server';

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('Missing SPOTIFY_CLIENT_ID env');
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing SPOTIFY_CLIENT_SECRET env');
}

if (!process.env.SPOTIFY_CALLBACK_URL) {
  throw new Error('Missing SPOTIFY_CALLBACK_URL env');
}

export const spotifyClient = new SpotifyWebApi();

export const spotifyApi = async (request: Request) => {
  const session = await spotifyStrategy.getSession(request);
  if (!session) {
    return null;
  }
  spotifyClient.setAccessToken(session.accessToken);
  return spotifyClient;
};
