import type { Prisma } from '@prisma/client';
import { Authenticator } from 'remix-auth';
import type { Session } from 'remix-auth-spotify';
import { SpotifyStrategy } from 'remix-auth-spotify';

import { notNull } from '~/lib/utils';
import { sessionStorage } from '~/services/session.server';

import { prisma } from './db.server';
import { userQ } from './scheduler/jobs/user';

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
  'user-library-read', // checks if a user saved specific songs (can show music_senders/user if a user already likes a song they suggested/queued )
  'user-read-email', // user spotify profile
  'user-read-private', // search for albums, artists, playlists, tracks, shows or episodes
  'user-read-playback-state', // get currently playing track and info about it (important)
  'user-read-recently-played', // recently played (can show music_senders/user if a user already listened to a song they suggested/queued recently)
  'user-read-currently-playing', // currently playing track only (do we need this?)
  'user-modify-playback-state', // to add to queue (can replace 'streaming' scope so we can integrate our own player to include more than just spotify)
  'user-follow-modify', // used to (un)follow users/artists
  'user-library-modify', // used to save songs to user's library
  'playlist-modify-public', // create playlists with custom image
  'user-top-read', // get top tracks
  'user-follow-read', // allows to check users follows
].join(' ');

export type UserProfile = Prisma.PromiseReturnType<typeof getUser>;

type CreateUser = {
  accessToken: string;
  expiresAt: number;
  id: string;
  refreshToken: string;
  tokenType: string;
  user: {
    create: {
      email: string;
      image: string;
      name: string;
    };
  };
};

export const createUser = async (data: CreateUser) => {
  const newUser = await prisma.user.create({ data, include: { user: true } });

  // scrape user's liked songs
  await userQ.add(newUser.id, { userId: newUser.id });

  // repeat the scrape every hour
  await userQ.add(
    newUser.id,
    { userId: newUser.id },
    {
      backoff: {
        delay: 1000 * 60 * 60,
        type: 'fixed',
      },
      // a job with an id that already exists will not be added.
      jobId: newUser.id,
      repeat: { every: 1000 * 60 * 60 },
    },
  );

  return newUser;
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ include: { user: true }, where: { id } });
  if (!user || !user.user) return null;
  return user;
};

export const updateToken = async (
  id: string,
  token: string,
  expiresAt: number,
  refreshToken?: string,
) => {
  const data = await prisma.user.update({
    data: { accessToken: token, expiresAt, refreshToken, revoked: false },
    where: { id },
  });
  console.log('updateToken -> data', new Date(data.expiresAt).toLocaleTimeString('en-US'));
  return data.expiresAt;
};

export const updateUserImage = async (id: string, image: string) => {
  const data = await prisma.profile.update({ data: { image }, where: { userId: id } });
  return data;
};

export const updateUserName = async (id: string, name: string) => {
  const data = await prisma.profile.update({ data: { name }, where: { userId: id } });
  return data;
};

export const getCurrentUser = async (request: Request) => {
  const session = await authenticator.isAuthenticated(request);
  if (!session || !session.user) return null;
  const id = session.user.id;
  let data = await prisma.profile.findUnique({
    where: { userId: id },
  });
  if (!data) return null;
  return data;
};

export const getAllUsers = async (isAuthenticated = false) => {
  const restrict = !isAuthenticated
    ? { user: { settings: { isNot: { isPrivate: true } } } }
    : undefined;

  const data = await prisma.user.findMany({
    orderBy: { user: { playback: { updatedAt: 'desc' } } },
    select: {
      user: {
        include: {
          playback: {
            include: {
              track: {
                include: {
                  liked: { select: { user: true } },
                  recent: { select: { user: true } },
                },
              },
            },
          },
          settings: true,
        },
      },
    },
    where: { revoked: false, ...restrict },
  });
  const users = data.map((user) => user.user).filter(notNull);
  return users;
};

const callbackURL = process.env.SPOTIFY_CALLBACK_URL;
// const callbackURL = 'http://192.168.0.105:3000/auth/spotify/callback';

export const spotifyStrategy = new SpotifyStrategy(
  {
    callbackURL,
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    scope: scopes,
    sessionStorage,
  },
  async ({ accessToken, extraParams, profile, refreshToken }) => {
    const response = {
      accessToken,
      expiresAt: Date.now() + extraParams.expiresIn * 1000,
      refreshToken,
      tokenType: extraParams.tokenType,
      user: {
        email: profile.emails[0].value,
        id: profile.id,
        image: profile.__json.images?.[0].url,
        name: profile.displayName,
      },
    };

    const existingUser = await getUser(profile.id);

    if (existingUser) {
      console.log(
        'spotify_callback -> session.expiresAt',
        new Date(response.expiresAt).toLocaleString('en-US'),
      );
      await updateToken(profile.id, accessToken, response.expiresAt, refreshToken);
      return response;
    }

    const user = {
      accessToken: response.accessToken,
      expiresAt: response.expiresAt,
      id: response.user.id,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType,
      user: {
        create: {
          email: response.user.email,
          image: response.user.image,
          name: response.user.name,
        },
      },
    };

    await createUser(user);

    return response;
  },
);

export const authenticator = new Authenticator<Session>(sessionStorage, {
  sessionErrorKey: spotifyStrategy.sessionErrorKey,
  sessionKey: spotifyStrategy.sessionKey,
});

authenticator.use(spotifyStrategy);
