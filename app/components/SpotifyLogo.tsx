import { Image, Link, useColorModeValue } from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';

type SpotifyLogoProps = {
  link?: boolean;
  h?: string;
  w?: string;
  mt?: string;
};
const SpotifyLogo = ({ link = true, h = '30px', w = '98px', mt = '0px' }: SpotifyLogoProps) => {
  const spotify_logo = useColorModeValue(Spotify_Logo_White, Spotify_Logo_Black);
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
          <Image minH={h} maxH={h} minW={w} maxW={w} src={spotify_logo} />
        </Link>
      ) : (
        <Image minH={h} maxH={h} minW={w} maxW={w} src={spotify_logo} />
      )}
    </>
  );
};
export default SpotifyLogo;
