import { Progress } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import type { WebPlaybackSDKProps } from 'react-spotify-web-playback-sdk';
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk';
import { useFetcher } from 'remix';
import SpotifyWebApi from 'spotify-web-api-js';

const SpotifyClientContext = createContext<SpotifyWebApi.SpotifyWebApiJs | undefined>(undefined);

export const SpotifyClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: token, load } = useFetcher<string>();

  useEffect(() => {
    load('/auth/token');
  }, [load]);

  const client = useMemo(() => {
    const _client = new SpotifyWebApi();
    _client.setAccessToken(token ?? null);
    return _client;
  }, [token]);

  const getOAuthToken: WebPlaybackSDKProps['getOAuthToken'] = useCallback(
    (callback) => token && callback(token),
    [token],
  );

  return (
    <SpotifyClientContext.Provider value={client}>
      {token === undefined ? (
        <Progress size="xs" isIndeterminate />
      ) : (
        // @ts-ignore https://www.mydatahack.com/moving-away-from-fc-and-vfc/
        <WebPlaybackSDK getOAuthToken={getOAuthToken} initialDeviceName="Spotify Clone">
          {children}
        </WebPlaybackSDK>
      )}
    </SpotifyClientContext.Provider>
  );
};

const useSpotifyClient = () => {
  const client = useContext(SpotifyClientContext);

  if (client === undefined) throw new Error();
  return client;
};

export default useSpotifyClient;
