import { useFetcher, useSearchParams } from '@remix-run/react';
// import type { LoaderArgs } from '@remix-run/server-runtime';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import {
  CloseButton,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import type { Profile, Track } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import Waver from '~/components/icons/Waver';
import UserMenu from '~/components/nav/UserMenu';
// import SessionTile from '~/components/sessions/SessionTile';
import Tile from '~/components/Tile';
import TilePrisma from '~/components/TilePrisma';
import UserTile from '~/components/UserTile';
import { useMobileKeyboardActions } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';
import { getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Explore = () => {
  const { top } = useTypedLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const [tracks, setTracks] = useState<Track[]>([]);

  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('music.800', 'music.200');

  const { data, load, state } = useFetcher();
  const { hideMenu, showMenu } = useMobileKeyboardActions();
  const busy = state === 'loading' ?? false;
  const currentUser = useSessionUser();
  const id = currentUser?.userId || 'daniel.valdecantos';

  const inputRef = useRef<HTMLInputElement>(null);

  const deleteSearch = () => {
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      deleteSearch();
    }
  };

  const onClose = () => {
    setSearch('');
    setTracks([]);
    const deleteParamDelay = setTimeout(() => {
      deleteSearch();
    }, 600);
    clearTimeout(deleteParamDelay);
  };

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        load(`/${id}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, load, id]);

  useEffect(() => {
    if (data) {
      setTracks(
        data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
          albumName: track.album.name,
          albumUri: track.album.uri,
          artist: track.album.artists[0].name,
          artistUri: track.artists[0].uri,
          explicit: track.explicit,
          id: track.id,
          image: track.album.images[0].url,
          link: track.external_urls.spotify,
          name: track.name,
          preview_url: track.preview_url,
          uri: track.uri,
        })),
      );
    }
  }, [data]);

  return (
    <Stack bg={bg} alignItems="center" h="100%">
      <HStack justifyContent="space-between" h="100%">
        <InputGroup
          w="90vw"
          mr="27px"
          mt="-5px"
          pos="fixed"
          top={2}
          left={0}
          bg={bg}
          zIndex={1}
          overflowY="hidden"
        >
          <InputLeftElement
            pointerEvents="all"
            children={
              <IconButton
                aria-label="search"
                icon={<SearchIcon boxSize="16px" />}
                variant="unstyled"
                color={color}
                cursor="pointer"
              />
            }
          />
          <Input
            ref={inputRef}
            name="spotify"
            value={search}
            placeholder="search"
            autoComplete="off"
            onChange={onChange}
            onBlur={showMenu}
            transition="all 0.5s ease-in-out"
            _placeholder={{ color: '#414040' }}
            focusBorderColor={color}
            onFocus={hideMenu}
          />
          {search && (
            <InputRightElement
              justifyContent="end"
              w="69px"
              children={
                <>
                  {busy && <Waver />}
                  <IconButton
                    aria-label="close"
                    variant="unstyled"
                    borderRadius={8}
                    onClick={onClose}
                    icon={<CloseButton />}
                  />
                </>
              }
            />
          )}
        </InputGroup>
        <UserMenu/>
      </HStack>
      <Stack pt="50px" overflowY="scroll" w="100%" h="91vh">
        {data?.users.map((user: Profile) => (
          <UserTile key={user.id} profile={user} />
        ))}
        {tracks?.map((track, index) => (
          <Tile key={track.id} layoutKey={"Explore" + index} track={track} profileId={id} list />
        ))}

        {!search ? (
          <>
            <HStack align="center">
              <Text>Top</Text>
              <Text fontSize={['9px', '10px']} opacity={0.6} pt="2px">
                7d
              </Text>
            </HStack>
            {top.map((track) => (
              <TilePrisma key={id} layoutKey="ExplorePrisma" track={track} profileId="" list />
            ))}
          </>
        ) : null}
      </Stack>
    </Stack>
  );
};

export const loader = async () => {
  const users = await getAllUsers();
  const SEVEN_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ['trackId'],
    orderBy: { _count: { trackId: 'desc' } },
    take: 10,
    where: { playedAt: { gte: SEVEN_DAYS } },
  });

  const top = await prisma.track.findMany({
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });

  return typedjson({ top, users });
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';

export default Explore;
