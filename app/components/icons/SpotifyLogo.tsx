import type { ChakraProps } from '@chakra-ui/react';
import { Image, useColorModeValue } from '@chakra-ui/react';

import spotify_icon_black from '~/assets/spotify_icon_black.png';
import spotify_icon_white from '~/assets/spotify_icon_white.png';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import useSessionUser from '~/hooks/useSessionUser';

type SpotifyLogoProps = {
  h?: string;
  icon?: boolean;
  link?: boolean;
  w?: string;
  white?: boolean;
} & ChakraProps;

const SpotifyLogo = ({
  link = true,
  icon = false,
  h = icon ? '25px' : '30px',
  w = icon ? '25px' : '98px',
  white,
  ...props
}: SpotifyLogoProps) => {
  const spotifyIcon = useColorModeValue(
    white ? spotify_icon_white : spotify_icon_black,
    spotify_icon_white,
  );
  const spotifyLogo = useColorModeValue(
    white ? Spotify_Logo_White : Spotify_Logo_Black,
    Spotify_Logo_White,
  );
  const spotify = icon ? spotifyIcon : spotifyLogo;
  const currentUser = useSessionUser();

  return (
    <>
      {!currentUser?.dev && (
        <Image
          minH={h}
          maxH={h}
          minW={w}
          maxW={w}
          src={spotify}
          {...props}
          onClick={(e) => {
            if (link) {
              e.preventDefault();
              window.open('https://open.spotify.com');
            }
          }}
        />
      )}
    </>
  );
};
export default SpotifyLogo;
