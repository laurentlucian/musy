import {
  Avatar,
  AvatarGroup,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Progress,
  Stack,
  Text,
  useColorModeValue,
  useInterval,
} from '@chakra-ui/react';
import type { Party, Profile } from '@prisma/client';
import { useFetcher, useTransition } from '@remix-run/react';
import { LoginCurve, LogoutCurve } from 'iconsax-react';
import spotify_icon_white from '~/assets/spotify-icon-white.png';
import spotify_icon_black from '~/assets/spotify-icon-black.png';
import { useEffect, useRef, useState } from 'react';
import { useDataRefresh } from 'remix-utils';
import explicitImage from '~/assets/explicit-solid.svg';
import AddQueue from './AddQueue';
import Tooltip from './Tooltip';

type PlayerProps = {
  id: string;
  device: string;
  currentUser: Profile | null;
  party: Party[];
  active: boolean;
  progress: number;
  duration: number;
  item: SpotifyApi.TrackObjectFull;
};

const Player = ({
  id,
  device,
  currentUser,
  party,
  active,
  progress,
  duration,
  item,
}: PlayerProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const color = useColorModeValue('music.900', 'music.50');
  const spotify_icon = useColorModeValue(spotify_icon_black, spotify_icon_white);
  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();

  const { refresh } = useDataRefresh();
  const refreshed = useRef(false);
  const [current, setCurrent] = useState(0);
  const percentage = duration ? (current / duration) * 100 : 0;

  const transition = useTransition();
  const busy = transition.submission?.formData.has('party') ?? false;

  // reset seek bar on new song

  const [size, setSize] = useState<string>('large');

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

  useEffect(() => {
    setCurrent(progress);
    refreshed.current = false;
  }, [progress]);

  // simulating a seek bar tick
  useInterval(
    () => {
      if (!duration) return null;
      // ref prevents from refreshing again before new data has hydrated; might loop otherwise
      if (current > duration && !refreshed.current) {
        refresh();
        refreshed.current = true;
      }
      setCurrent((prev) => prev + 1000);
    },
    active ? 1000 : null,
  );

  useInterval(
    () => {
      refresh();
    },
    // -> checks if user started playing every minute
    active ? null : 60000,
    // -> refreshes every 30s regardless
    // 30000,
  );

  if (!item) return null;

  const link = item.uri;
  const artistLink = item.album?.artists[0].uri;
  const albumLink = item.album?.uri;

  return (
    <Stack w={[363, '100%']} bg={bg} spacing={0} borderRadius={5} pos="sticky" top={0} zIndex={10}>
      <HStack h="112px" spacing={2} px="2px" py="2px" justify="space-between">
        <Stack pl="7px" spacing={2} h="100%" flexGrow={1}>
          <Flex direction="column">
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
            <HStack>
              <Text fontSize="12px" fontWeight="normal">
                Listening on:{' '}
              </Text>
              <Text fontSize="14px" fontWeight="semibold">
                {device}
              </Text>
            </HStack>
          </Flex>

          {active && (
            <HStack>
              {/* lets owner join own party for testing */}
              {/* {currentUser && ( */}
              {currentUser?.userId !== id && (
                <>
                  {!isUserInParty && (
                    <AddQueue
                      key={id}
                      uri={item.uri}
                      image={item.album?.images[0].url}
                      albumUri={item.album?.uri}
                      albumName={item.album?.name}
                      name={item.name}
                      artist={item.album?.artists[0].name}
                      artistUri={artistLink}
                      explicit={item.explicit ?? false}
                      userId={currentUser?.userId}
                    />
                  )}
                  <fetcher.Form
                    action={isUserInParty ? `/${id}/leave` : `/${id}/join`}
                    method="post"
                  >
                    <Tooltip label={isUserInParty ? 'Leave session' : 'Join session'}>
                      <IconButton
                        aria-label={isUserInParty ? 'Leave' : 'Join'}
                        name="party"
                        icon={
                          isUserInParty ? <LogoutCurve size="24px" /> : <LoginCurve size="24px" />
                        }
                        variant="ghost"
                        type="submit"
                        cursor="pointer"
                        isLoading={busy}
                      />
                    </Tooltip>
                  </fetcher.Form>
                </>
              )}
              {party.length && (
                <AvatarGroup size="xs" spacing={-2} max={5}>
                  {party.map((u) => {
                    return <Avatar key={u.userId} name={u.userName} src={u.userImage} />;
                  })}
                </AvatarGroup>
              )}

              <Image boxSize="24px" src={spotify_icon} />
            </HStack>
          )}
        </Stack>
        <Link href={albumLink ?? ''} target="_blank">
          <Tooltip label={item.album.name} placement="top-end" closeDelay={700}>
            <Image
              src={item.album?.images[0].url}
              mb={size === 'large' ? [0, 133] : size === 'medium' ? [0, 65] : 0}
              boxSize={size === 'large' ? [108, 243] : size === 'medium' ? [108, 180] : 108}
              borderRadius={2}
              transition="width 0.25s, height 0.25s, margin-bottom 0.25s"
            />
          </Tooltip>
        </Link>
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
        value={percentage}
      />
    </Stack>
  );
};
export default Player;
