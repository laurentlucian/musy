import { Avatar, AvatarGroup, Flex, HStack, Image, Progress, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'remix';
import listen_width from '~/assets/listen-with.svg';
import spotify_icon from '~/assets/spotify-icon-white.png';

type Type = {
  id: number;
  name: string | undefined;
  artist: string;
  image: string;
  device: string;
  progress: number;
  type: 'track' | 'episode' | undefined;
};

const Player = ({ id, name, artist, image, device, type, progress }: Type) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const color = useColorModeValue('music.900', 'music.50');

  return (
    <Stack w={[363, '100%']} bg={bg} spacing={0} borderRadius={5}>
      <HStack h="112px" spacing={2} px="2px" py="2px" justify="space-between">
        <Stack pl="7px" spacing={2} flexGrow={1}>
          <Flex direction="column">
            <Text noOfLines={[1]}>{name}</Text>
            <Text opacity={0.8} fontSize="13px">
              {artist}
            </Text>
            <Text fontSize="14px" fontWeight="semibold">
              {device}
            </Text>
          </Flex>
          <HStack>
            <Link to={`/party/join/${id}`}>
              {/* make another asset to leave session */}
              <Image boxSize="24px" src={listen_width} />
            </Link>
            <AvatarGroup size="xs" spacing={-2} max={5}>
              {[...new Array(3)].map((v, idx) => {
                return <Avatar key={idx} name="Ryan Florence" src="https://bit.ly/ryan-florence" />;
              })}
            </AvatarGroup>
            <Image boxSize="22px" src={spotify_icon} />
            <Text fontSize="14px" opacity={0.8} flexGrow={1} textAlign="right">
              9 plays
            </Text>
          </HStack>
        </Stack>
        <Image src={image} m={0} boxSize={108} borderRadius={2} />
      </HStack>
      <Progress
        sx={{
          backgroundColor: bg,
          '> div': {
            backgroundColor: color,
          },
        }}
        borderBottomLeftRadius={2}
        borderBottomRightRadius={2}
        h="2px"
        value={progress}
      />
    </Stack>
  );
};
export default Player;
