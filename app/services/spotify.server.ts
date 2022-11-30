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
  let newToken = data.accessToken;
  if (isExpired) {
    console.log('Access Token expired');
    spotifyClient.setRefreshToken(data.refreshToken);
    const { body } = await spotifyClient.refreshAccessToken();
    spotifyClient.setAccessToken(body.access_token);
    newToken = body.access_token;

    const expiresAt = Date.now() + body.expires_in * 1000;
    await updateToken(data.user.userId, body.access_token, expiresAt, body.refresh_token);
  }

  return { spotify: spotifyClient, user: data.user, token: newToken };
};

export interface ContextObjectCustom extends Omit<SpotifyApi.ContextObject, 'type'> {
  name?: string;
  image?: string;
  type: 'collection' | SpotifyApi.ContextObject['type'];
}

export interface CurrentlyPlayingObjectCustom
  extends Omit<SpotifyApi.CurrentlyPlayingObject, 'context'> {
  context: ContextObjectCustom;
}

export interface Playback {
  userId: string;
  currently_playing: CurrentlyPlayingObjectCustom | null;
  queue: SpotifyApi.TrackObjectFull[];
}

export const getUserQueue = async (id: string) => {
  const { token } = await spotifyApi(id);
  if (!token)
    return {
      currently_playing: null,
      queue: [],
    };

  const calls = [
    fetch('https://api.spotify.com/v1/me/player/queue', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    // fetch('https://api.spotify.com/v1/me/player/devices', {
    //   headers: { Authorization: `Bearer ${token}` },
    // }),
  ];
  const [call1, call2] = await Promise.all(calls);

  const { queue } = await call1.json();
  const currently_playing = call2.status === 200 ? await call2.json() : null;
  // const [device] =
  //   call3.status === 200
  //     ? await call3.json().then((v) => {
  //         console.log('v', v);
  //         return v.devices.filter((d: any) => d.is_active === true);
  //       })
  //     : null;
  // currently_playing.device = device;

  if (currently_playing.context) {
    switch (currently_playing.context.type) {
      case 'playlist':
        const res = await fetch(
          'https://api.spotify.com/v1/playlists/' +
            currently_playing.context.href.match(/playlists\/(.*)/)?.[1] ?? '',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res) break;
        const playlist = await res.json();

        currently_playing.context.name = playlist.name;
        currently_playing.context.image = playlist.images[0].url;
        break;
      case 'collection':
        currently_playing.context.name = 'Liked Songs';
        currently_playing.context.image =
          'https://t.scdn.co/images/3099b3803ad9496896c43f22fe9be8c4.png';
        break;
    }
  }

  const isEpisode = currently_playing?.currently_playing_type === 'episode';
  const data = {
    userId: id,
    currently_playing: isEpisode ? null : currently_playing,
    queue: isEpisode ? [] : queue,
  };

  if (data) {
    return data as Playback;
  } else
    return {
      userId: id,
      currently_playing: null,
      queue: [],
    };
};
