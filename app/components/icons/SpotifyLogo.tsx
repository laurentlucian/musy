import { Image, Link, useColorModeValue } from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import spotify_icon_white from '~/assets/spotify_icon_white.png';
import spotify_icon_black from '~/assets/spotify_icon_black.png';

type SpotifyLogoProps = {
  link?: boolean;
  h?: string;
  w?: string;
  mt?: string;
  icon?: boolean;
};

const SpotifyLogo = ({
  link = true,
  h = '30px',
  w = '98px',
  mt = '0px',
  icon = false,
}: SpotifyLogoProps) => {
  const spotifyIcon = useColorModeValue(spotify_icon_white, spotify_icon_black);
  const spotifyLogo = useColorModeValue(Spotify_Logo_White, Spotify_Logo_Black);
  const spotify = icon ? spotifyIcon : spotifyLogo;
  return (
    <>
      {link ? (
        <Link
          href="https://open.spotify.com"
          target="_blank"
          rel="external"
          mt={mt}
          _focus={{ boxShadow: 'none !important', outline: 'none !important' }}
        >
          <Image minH={h} maxH={h} minW={w} maxW={w} src={spotify} />
        </Link>
      ) : (
        <Image minH={h} maxH={h} minW={w} maxW={w} src={spotify} />
      )}
    </>
  );
};
export default SpotifyLogo;
