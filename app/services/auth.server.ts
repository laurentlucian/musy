import { prisma } from './db.server';
import { Authenticator } from 'remix-auth';
import type { Session } from 'remix-auth-spotify';
import { SpotifyStrategy } from 'remix-auth-spotify';

import { sessionStorage } from '~/services/session.server';

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('Missing SPOTIFY_CLIENT_ID env');
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing SPOTIFY_CLIENT_SECRET env');
}

if (!process.env.SPOTIFY_CALLBACK_URL) {
  throw new Error('Missing SPOTIFY_CALLBACK_URL env');
}

// See https://developer.spotify.com/documentation/general/guides/authorization/scopes
const scopes = [
  'streaming', // (must have spotify premium) --> controls playback of tracks through a spotify player (might not need if we change direction with app (see user-modify-playback-state))
  'user-library-read', //checks if a user saved specific songs (can show music_senders/user if a user already likes a song they suggested/queued )
  'user-read-email', // user spotify profile
  'user-read-private', //search for albums, artists, playlists, tracks, shows or episodes
  'user-read-playback-state', // get currently playing track and info about it (important)
  'user-read-recently-played', // recently played (can show music_senders/user if a user already listened to a song they suggested/queued recently)
  'user-read-currently-playing', // currently playing track only (do we need this?)
  'user-modify-playback-state', // to add to queue (can replace 'streaming' scope so we can integrate our own player to include more than just spotify)
  'user-follow-modify', //used to (un)follow users/artists
  'playlist-modify-public', //can create playlists with custom image
].join(' ');

type CreateUser = {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
  user: {
    create: {
      name: string;
      email: string;
      image: string;
    };
  };
};

export const createUser = async (data: CreateUser) => {
  const newUser = await prisma.user.create({ data, include: { user: true } });
  return newUser;
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, include: { user: true } });
  if (!user || !user.user) return null;
  return user;
};

export const updateToken = async (id: string, token: string, expiresAt: number) => {
  const data = await prisma.user.update({ where: { id }, data: { accessToken: token, expiresAt } });
  console.log('updateToken -> data', new Date(data.expiresAt).toLocaleTimeString('en-US'));
  return data.expiresAt;
};

export const getCurrentUser = async (request: Request) => {
  const session = await spotifyStrategy.getSession(request);
  if (!session || !session.user) return null;
  const id = session.user?.id;
  let data = await prisma.user.findUnique({ where: { id }, include: { user: true } });
  if (!data) return null;
  return data.user;
};

export const getAllUsers = async () => {
  const data = await prisma.user.findMany({ select: { user: true } });
  const users = data.map((user) => user.user);
  return users;
};

export const spotifyStrategy = new SpotifyStrategy(
  {
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: process.env.SPOTIFY_CALLBACK_URL, //callbackURL and redirect_uri used interchangeably, but redirect_uri is a req param for req user authorization also specify redirect_uri in spotify dev dashboard (must match)
    sessionStorage,
    scope: scopes,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => ({
    accessToken,
    refreshToken,
    expiresAt: Date.now() + extraParams.expiresIn * 1000,
    tokenType: extraParams.tokenType,
    user: {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      image: profile.__json.images?.[0].url,
    },
  }),
);

export const authenticator = new Authenticator<Session>(sessionStorage, {
  sessionKey: spotifyStrategy.sessionKey,
  sessionErrorKey: spotifyStrategy.sessionErrorKey,
});

authenticator.use(spotifyStrategy);
