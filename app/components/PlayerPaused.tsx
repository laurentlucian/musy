import { Flex, HStack, Image, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import explicitImage from '~/assets/explicit-solid.svg';
import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';
// import AddQueue from './AddQueue';

type PlayerPausedProps = {
  item: SpotifyApi.TrackObjectFull;
};

const PlayerPaused = ({ item }: PlayerPausedProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const link = item.uri;
  const artistLink = item.album?.artists[0].uri;
  const albumLink = item.album?.uri;
  const name = item.name;
  const artist = item.artists[0].name;
  const image = item.album?.images[1].url;
  const explicit = item.explicit;

  const [size, setSize] = useState<string>('Large');
  useEffect(() => {
    setSize('large');
    const checkStick = () => {
      window.scrollY <= 100
        ? setSize('large')
        : window.scrollY <= 168
        ? setSize('medium')
        : setSize('small');
    };
    window.addEventListener('scroll', checkStick);

    return () => window.removeEventListener('scroll', checkStick);
  }, []);

  return (
    <Stack
      w={[363, '100%']}
      bg={bg}
      backdropFilter="blur(27px)"
      spacing={0}
      borderRadius={size === 'small' ? 0 : 5}
      pos="sticky"
      top={0}
      zIndex={10}
    >
      <HStack h="112px" spacing={2} px="2px" py="2px" justify="space-between">
        <Stack pl="7px" spacing={2} h="100%" flexGrow={1}>
          <Flex direction="column">
            <Link href={link ?? ''} target="_blank">
              <Text noOfLines={[1]}>{name}</Text>
            </Link>
            <Flex>
              {explicit && <Image mr={1} src={explicitImage} w="19px" />}
              <Link href={artistLink ?? ''} target="_blank">
                <Text opacity={0.8} fontSize="13px">
                  {artist}
                </Text>
              </Link>
            </Flex>
            <Image height="30px" width="98px" src={spotify_logo} mt="30px" />
          </Flex>
        </Stack>
        <Link href={albumLink} target="_blank">
          <Tooltip label={item.album.name} placement="top-end">
            <Image
              src={image}
              mb={size === 'large' ? [0, 47, 219] : size === 'medium' ? [0, 47, 108] : 0}
              boxSize={
                size === 'large' ? [108, 160, 334] : size === 'medium' ? [108, 160, 221] : 108
              }
              borderRadius={size === 'small' ? 0 : 2}
              transition="width 0.25s, height 0.25s, margin-bottom 0.25s"
            />
          </Tooltip>
        </Link>
      </HStack>
    </Stack>
  );
};
export default PlayerPaused;
