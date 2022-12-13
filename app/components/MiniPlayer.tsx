import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
  useMediaQuery,
  Icon,
} from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useNavigate, useTransition } from '@remix-run/react';
import { InfoCircle, Information } from 'iconsax-react';
import explicitImage from '~/assets/explicit-solid.svg';
import type { Playback } from '~/services/spotify.server';
import PlayerBar from './PlayerBar';
import Tooltip from './Tooltip';
import Waver from './Waver';

type PlayerProps = {
  user: Profile;
  playback?: Playback;
};

const MiniPlayer = ({ user, playback }: PlayerProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const transition = useTransition();
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');
  const navigate = useNavigate();

  const artist =
    playback?.currently_playing?.item?.type === 'track'
      ? playback?.currently_playing?.item?.album?.artists[0].name
      : playback?.currently_playing?.item?.show.name;

  const image =
    playback?.currently_playing?.item?.type === 'track'
      ? playback?.currently_playing?.item?.album?.images[0].url
      : playback?.currently_playing?.item?.images[0].url;

  return (
    <Stack w={[363, '100%']} bg={bg} spacing={0} borderRadius={5}>
      <Button
        display="flex"
        flexDirection="column"
        onClick={() => navigate(`/${user.userId}`)}
        // to={`/${user.userId}`}
        variant="ghost"
        h={playback ? ['100px', '120px'] : '65px'}
        w={[363, '100%']}
        pr={0}
      >
        <HStack spacing={3} w="100%">
          <Image boxSize="50px" borderRadius="100%" src={user.image} />
          <Stack>
            <HStack>
              <Text fontWeight="bold" fontSize={['15px', '20px']}>
                {user.name.split(/[\s.]+/).slice(0, 1)}
              </Text>
              {!isSmallScreen && transition.location?.pathname.includes(user.userId) && <Waver />}
            </HStack>
            <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }}>
              {user.bio?.slice(0, 15)}
            </Text>
          </Stack>

          {playback && playback.currently_playing && playback.currently_playing.item ? (
            <HStack w="100%" spacing={2} justify="end">
              <Stack spacing={1} h="100%" align="end">
                {!isSmallScreen && (
                  <>
                    <LinkB
                      as="span"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(playback.currently_playing?.item?.uri);
                      }}
                    >
                      <Text
                        noOfLines={[1]}
                        maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                        fontSize={{ base: 'smaller', md: 'sm' }}
                      >
                        {playback.currently_playing?.item?.name}
                      </Text>
                    </LinkB>
                    <Flex>
                      {playback?.currently_playing.item?.explicit && (
                        <Image mr={1} src={explicitImage} w="16px" />
                      )}
                      <LinkB
                        as="span"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            playback.currently_playing?.item?.type === 'track'
                              ? playback.currently_playing?.item.album?.artists[0].uri
                              : '',
                          );
                        }}
                      >
                        <Text
                          opacity={0.8}
                          noOfLines={[1]}
                          maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                          fontSize={{ base: 'smaller', md: 'xs' }}
                        >
                          {artist}
                        </Text>
                      </LinkB>
                    </Flex>
                  </>
                )}
                <HStack>
                  {playback.queue &&
                    playback.queue
                      .slice(0, isSmallScreen ? 1 : 2)
                      .reverse()
                      .map((track, idx) => (
                        <LinkB
                          as="span"
                          alignSelf="end"
                          key={idx}
                          // href={track.uri}
                          // target="_blank"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/analysis/' + track.id);
                          }}
                        >
                          <Tooltip
                            label={
                              <HStack p="2px">
                                <Text>{track.name}</Text>
                                <Icon boxSize="20px" as={InfoCircle} />
                              </HStack>
                            }
                          >
                            <Image
                              src={track.album.images[0].url}
                              borderRadius={5}
                              w={['60px', '75px']}
                              draggable={false}
                            />
                          </Tooltip>
                        </LinkB>
                      ))}
                </HStack>

                {/* {playback.currently_playing.context && playback.currently_playing.context.name && (
                    <Tooltip label={playback.currently_playing.context.name}>
                      <Image
                        src={playback.currently_playing.context.image}
                        borderRadius={5}
                        w={{ base: '50px', md: '65px' }}
                        draggable={false}
                      />
                    </Tooltip>
                  )} */}
              </Stack>

              {/* {isSmallScreen &&
                playback.currently_playing.context &&
                playback.currently_playing.context.name && (
                  <Tooltip label={playback.currently_playing.context.name}>
                    <Image
                      alignSelf="end"
                      src={playback.currently_playing.context.image}
                      borderRadius={5}
                      w={{ base: '50px', md: '65px' }}
                      draggable={false}
                    />
                  </Tooltip>
                )} */}
              <Tooltip
                label={
                  <HStack p="2px">
                    <Text>{playback.currently_playing.item?.name}</Text>
                    <Icon boxSize="20px" as={InfoCircle} />
                  </HStack>
                }
              >
                <LinkB
                  as="span"
                  // href={
                  //   playback.currently_playing.item &&
                  //   playback.currently_playing.item.type === 'track'
                  //     ? playback.currently_playing?.item.album?.uri
                  //     : ''
                  // }
                  // target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = playback.currently_playing?.item?.id;
                    navigate('/analysis/' + id);
                  }}
                >
                  <Image
                    src={image}
                    m={0}
                    boxSize={playback ? ['100px', '120px'] : '60px'}
                    borderRadius={2}
                  />
                </LinkB>
              </Tooltip>
            </HStack>
          ) : null}
        </HStack>
      </Button>
      {playback && playback.currently_playing && (
        <PlayerBar playback={playback.currently_playing} />
      )}
    </Stack>
  );
};
export default MiniPlayer;
