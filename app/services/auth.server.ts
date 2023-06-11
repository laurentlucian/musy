import { Authenticator } from 'remix-auth';
import type { Session } from 'remix-auth-spotify';
import { SpotifyStrategy } from 'remix-auth-spotify';

import { sessionStorage } from '~/services/session.server';

import { createUser, getUser, updateToken } from './prisma/users.server';
import { userQ } from './scheduler/jobs/user.server';

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
  // 'streaming', // (must have spotify premium) --> controls playback of tracks through a spotify player (might not need if we change direction with app (see user-modify-playback-state))
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

    const newUser = {
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

    const user = await createUser(newUser);
    await userQ.add('update-liked', { userId: user.id });

    return response;
  },
);

export const authenticator = new Authenticator<Session>(sessionStorage, {
  sessionErrorKey: spotifyStrategy.sessionErrorKey,
  sessionKey: spotifyStrategy.sessionKey,
});

authenticator.use(spotifyStrategy);
