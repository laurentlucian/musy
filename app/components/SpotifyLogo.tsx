import { Image, Link, useColorModeValue } from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';

type SpotifyLogoProps = {
  link?: boolean;
  h?: string;
  w?: string;
  mt?: string;
};
const SpotifyLogo = ({ link = true, h, w, mt }: SpotifyLogoProps) => {
  const height = h ?? '30px';
  const width = w ?? '98px';
  const marginTop = mt ?? '0px';
  const spotify_logo = useColorModeValue(Spotify_Logo_White, Spotify_Logo_Black);
  return (
    <>
      {link ? (
        <Link
          href="https://open.spotify.com"
          target="_blank"
          rel="external"
          mt={marginTop}
          _focus={{ boxShadow: 'none !important', outline: 'none !important' }}
        >
          <Image height={height} minW={width} maxW={width} src={spotify_logo} />
        </Link>
      ) : (
        <Image height={height} minW={width} maxW={width} src={spotify_logo} />
      )}
    </>
  );
};
export default SpotifyLogo;
