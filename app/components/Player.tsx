import {
  Avatar,
  AvatarGroup,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useInterval,
  Collapse,
  useDisclosure,
  Box,
  useMediaQuery,
  Show,
} from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import { useFetcher } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { ArrowDown2, ArrowUp2, People } from 'iconsax-react';
import type { Party, Profile } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { useDataRefresh } from 'remix-utils';
import Tooltip from './Tooltip';
import PlayerBar from './PlayerBar';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import PlayingFromTooltip from './PlayingFromTooltip';
import ActionMenu from './menu/ActionMenu';
import PlayController from './PlayController';

type PlayerProps = {
  id: string;
  currentUser: Profile | null;
  party: Party[];
  playback: CurrentlyPlayingObjectCustom;
  item: SpotifyApi.TrackObjectFull;
  username: string;
};

const Player = ({ id, currentUser, party, playback, item, username }: PlayerProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();
  const { refresh } = useDataRefresh();
  const busy = fetcher.submission?.formData.has('party') ?? false;
  // const loading = fetcher.submission?.formData.has('play') ?? false;
  const [size, setSize] = useState('large');
  const [playingFrom, setPlayingFrom] = useState(false);
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');
  console.log(playback.is_playing, 'test');

  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
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

  const active = playback.is_playing;
  useInterval(
    () => {
      refresh();
    },
    // -> checks if user started playing every minute
    active ? null : 60000,
    // -> refreshes every 30s regardless
    // 30000,
  );
  const interval = useCallback(
    () => setInterval(() => setPlayingFrom(!playingFrom), 6900),
    [playingFrom],
  );

  useEffect(() => {
    if (
      item.album.album_type === 'single' &&
      item.album.total_tracks === 1 &&
      playback?.context?.type !== 'artist' &&
      playback?.context?.type !== 'playlist'
    ) {
      clearInterval(interval());
      setPlayingFrom(false);
    } else {
      interval();
    }
  }, [playback.context, interval, item.album.album_type, item.album.type, item.album.total_tracks]);

  if (!item) return null;

  const link = item.uri;
  const artistLink = item.album?.artists[0].uri;
  const albumLink = item.album?.uri;

  return (
    <Stack pos="sticky" top={0} zIndex={1} spacing={-1}>
      <Stack backdropFilter="blur(27px)" spacing={0} borderRadius={size === 'small' ? 0 : 5}>
        <Collapse in={!isOpen} animateOpacity unmountOnExit>
          <Stack bg={bg} backdropFilter={isSmallScreen ? 'blur(27px)' : '0'}>
            <Flex h="135px" px="2px" py="2px" justify="space-between">
              <Stack pl="7px" spacing={1} flexGrow={1}>
                <Stack direction="column" spacing={0.5}>
                  <Link href={link ?? ''} target="_blank">
                    <Text noOfLines={[1]}>{item.name}</Text>
                  </Link>
                  <Flex>
                    {item.explicit && <Image mr={1} src={explicitImage} w="19px" />}
                    <Link href={artistLink ?? ''} target="_blank">
                      <Text opacity={0.8} fontSize="13px">
                        {item.album?.artists[0].name}
                      </Text>
                    </Link>
                  </Flex>
                  {playback.context && (
                    <>
                      <Text
                        fontSize="13px"
                        transition="opacity 1.69s ease-in-out"
                        opacity={playingFrom ? 1 : 0}
                      >
                        Playing From{' '}
                        {item.album.album_type === 'single' &&
                        playback.context.type === 'album' &&
                        item.album.total_tracks !== 1
                          ? 'EP'
                          : playback.context.type.charAt(0).toUpperCase() +
                            playback.context.type.slice(1)}
                      </Text>
                      <Tooltip
                        label={
                          <PlayingFromTooltip // tooltip does not show properly when playing from artist
                            name={playback.context.name}
                            description={playback.context.description}
                            image={playback.context.image}
                          />
                        }
                        placement="bottom-start"
                      >
                        <Link
                          href={playback.context.uri}
                          fontSize="15px"
                          fontWeight="bold"
                          transition="opacity 1.69s ease-in-out"
                          opacity={playingFrom ? 1 : 0}
                          overflow="scroll"
                          whiteSpace="normal"
                          wordBreak="break-word"
                          noOfLines={1}
                        >
                          {playback.context.name
                            ? playback.context.name
                            : playback.context.type === 'artist'
                            ? item.artists[0].name
                            : item.album.name}
                        </Link>
                      </Tooltip>
                    </>
                  )}
                  <Stack spacing={1} pos="absolute" pt="48px" lineHeight="shorter">
                    <Text
                      fontSize="13px"
                      fontWeight="normal"
                      transition="opacity 1.69s ease-in-out"
                      opacity={playingFrom ? 0 : 1}
                    >
                      Listening on
                    </Text>
                    <Text
                      fontSize="15px"
                      fontWeight="bold"
                      transition="opacity 1.69s ease-in-out"
                      opacity={playingFrom ? 0 : 1}
                    >
                      {playback.device.name.split(' ').slice(0, 2).join(' ')}
                    </Text>
                  </Stack>
                </Stack>
                {active ? (
                  <HStack mt="auto !important" mb="5px !important">
                    {/* lets owner join own party for testing */}
                    {/* {currentUser && ( */}
                    <Link href="https://open.spotify.com" target="_blank" rel="external">
                      <Image height="30px" minW="108px" src={spotify_logo} />
                    </Link>
                    <Show above="md">
                      {currentUser?.userId === id && (
                        <PlayController fetcher={fetcher} playback={playback} id={id} />
                      )}
                    </Show>

                    {currentUser?.userId !== id && (
                      <>
                        <ActionMenu
                          key={id}
                          track={{
                            uri: item.uri,
                            trackId: item.id,
                            name: item.name,
                            artist: item.album?.artists[0].name,
                            artistUri: artistLink,
                            albumName: item.album?.name,
                            albumUri: albumLink,
                            explicit: item.explicit,
                            image: item.album?.images[0].url,
                          }}
                          fromUserId={currentUser?.userId}
                          sendTo={username}
                          // placement="bottom-start"
                          // offset={[-118, 0]}
                        />
                        <Tooltip label={isUserInParty ? 'Leave session' : 'Join session'}>
                          <fetcher.Form
                            action={isUserInParty ? `/${id}/leave` : `/${id}/join`}
                            method="post"
                            replace
                          >
                            <IconButton
                              aria-label={isUserInParty ? 'Leave' : 'Join'}
                              name="party"
                              icon={<People size="24px" />}
                              color={isUserInParty ? 'spotify.green' : undefined}
                              _hover={{ color: isUserInParty ? 'red.600' : 'spotify.green' }}
                              variant="ghost"
                              type="submit"
                              cursor="pointer"
                              isLoading={busy}
                            />
                          </fetcher.Form>
                        </Tooltip>
                      </>
                    )}
                    {party.length && (
                      <AvatarGroup size="xs" spacing={-2} max={5}>
                        {party.map((u) => {
                          return <Avatar key={u.userId} name={u.userName} src={u.userImage} />;
                        })}
                      </AvatarGroup>
                    )}
                  </HStack>
                ) : (
                  <Link href="https://open.spotify.com">
                    <Image height="30px" width="98px" src={spotify_logo} />
                  </Link>
                )}
              </Stack>
              <HStack spacing={1} align="end">
                {/* {playback.context &&
                    playback.context.name &&
                    !isSmallScreen &&
                    (playback.context.type === 'collection' ? (
                      <Tooltip label={playback.context.name} placement="bottom-end">
                        <Image
                          src={playback.context.image}
                          boxSize={{ base: '65px', sm: '75px', lg: '108px' }}
                          borderRadius={2}
                          transition="width 0.25s, height 0.25s"
                        />
                      </Tooltip>
                    ) : (
                      <Link href={playback.context?.uri} target="_blank">
                        <Tooltip label={playback.context.name} placement="bottom-end">
                          <Image
                            src={playback.context.image}
                            boxSize={{ base: '45px', sm: '75px', lg: '108px' }}
                            borderRadius={2}
                            transition="width 0.25s, height 0.25s"
                          />
                        </Tooltip>
                      </Link>
                    ))} */}
                <Link href={albumLink ?? ''} target="_blank">
                  <Tooltip label={item.album.name} placement="bottom-end">
                    <Image
                      src={item.album?.images[0].url}
                      mt={
                        size === 'large'
                          ? [0, -47, -47, -47, -191]
                          : size === 'medium'
                          ? [0, -47, -47, -47, '-78px']
                          : 0
                      }
                      boxSize={
                        size === 'large'
                          ? [130, 160, 160, 200, 334]
                          : size === 'medium'
                          ? [130, 160, 160, 200, 221]
                          : 130
                      }
                      minW={
                        size === 'large'
                          ? [130, 160, 160, 200, 334]
                          : size === 'medium'
                          ? [130, 160, 160, 200, 221]
                          : 130
                      }
                      borderRadius={size === 'small' ? 0 : 2}
                      transition="width 0.25s, height 0.25s, margin-top 0.25s, min-width 0.25s"
                      pos="absolute"
                      right={0}
                      top={0}
                    />
                  </Tooltip>
                </Link>
              </HStack>
            </Flex>
            <Show below="md">
              {currentUser?.userId === id && (
                <HStack pl={2}>
                  <PlayController fetcher={fetcher} playback={playback} id={id} />
                </HStack>
              )}
            </Show>
            <PlayerBar playback={playback} />
          </Stack>
        </Collapse>
      </Stack>
      <Box
        w="-webkit-fit-content"
        bg={bg}
        borderRadius="0px 0px 3px 3px"
        zIndex={-1}
        backdropFilter="blur(27px)"
      >
        <IconButton
          icon={!isOpen ? <ArrowDown2 /> : <ArrowUp2 />}
          variant="ghost"
          onClick={onToggle}
          aria-label={isOpen ? 'open player' : 'close player'}
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
          boxShadow="none"
        />
      </Box>
    </Stack>
  );
};
export default Player;
