import { useFetcher, useSearchParams } from '@remix-run/react';
import { useState, useRef, type ChangeEvent, useEffect } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import {
  CloseButton,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useEventListener,
} from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '~/lib/icons/Waver';
import type { Track } from '~/lib/types/types';

import UserTile from '../nav/UserTile';
import Tile from '../tile/Tile';
import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
const NavSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);

  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const currentUser = useSessionUser();
  const id = currentUser?.userId;
  const { data, load, state } = useFetcher();

  const busy = state === 'loading' ?? false;

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.700');

  const divRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deleteSearch = () => {
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };
  const handleOpenButton = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    if (disable) {
      showAlert();
    } else {
      setSearch('');
      setShow(!show);
      setTracks([]);
      const deleteParamDelay = setTimeout(() => {
        deleteSearch();
      }, 600);
      clearTimeout(deleteParamDelay);
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      deleteSearch();
    }
  };
  const handleCloseButton = () => {
    setSearch('');
    setShow(false);
    setTracks([]);
    const deleteParamDelay = setTimeout(() => {
      deleteSearch();
    }, 600);
    clearTimeout(deleteParamDelay);
  };
  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      handleCloseButton();
    }
  });
  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        load(`/${id}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, load, id]);

  useEffect(() => {
    const handleOpenButtonOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node) && search === '') {
        setShow(false);
        setTracks([]);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('click', handleOpenButtonOutside);
    return () => {
      document.removeEventListener('click', handleOpenButtonOutside);
    };
  }, [divRef, search]);

  useEffect(() => {
    if (show) inputRef.current?.focus();
    else inputRef.current?.blur();
  }, [show]);

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

  const layoutKey = 'NavSearch';

  return (
    <div ref={divRef}>
      <Popover
        closeOnBlur={false}
        placement="bottom"
        isOpen={tracks.length >= 1}
        autoFocus={false}
        isLazy
        offset={[0, 10]}
      >
        <PopoverTrigger>
          <InputGroup w={show ? '300px' : '30px'} transition="all 0.2s ease-in-out" size="sm">
            <InputLeftElement
              pointerEvents="all"
              children={
                <IconButton
                  aria-label="search"
                  icon={<SearchIcon boxSize="16px" />}
                  variant="unstyled"
                  color={color}
                  cursor="pointer"
                  onClick={(e) => handleOpenButton(e)}
                />
              }
            />
            <Input
              ref={inputRef}
              name="spotify"
              value={search}
              variant="flushed"
              placeholder="search"
              autoComplete="off"
              onChange={handleChange}
              border={show ? undefined : '#0000'}
              w={show ? '300px' : '30px'}
              transition="all 0.2s ease-in-out"
              cursor={show ? 'text' : 'pointer'}
              _placeholder={{ color: '#414040' }}
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
                      onClick={handleCloseButton}
                      icon={<CloseButton />}
                    />
                  </>
                }
              />
            )}
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent
          w="300px"
          h="300px"
          overflowY="scroll"
          bg={bg}
          color={color}
          boxShadow="0px 0px 10px 2px rgba(117,117,117,0.39)"
        >
          <PopoverBody>
            <Stack>
              {data?.users.map((user: Profile) => (
                <UserTile key={user.id} profile={user} />
              ))}

              {tracks.length >= 1 &&
                tracks.map((track, index) => (
                  <Tile
                    key={track.id}
                    index={index}
                    layoutKey={layoutKey}
                    track={track}
                    tracks={tracks}
                    image={<TileTrackImage box={{ w: '40px' }} />}
                    info={<TileTrackInfo track={track} />}
                    list
                  />
                ))}
            </Stack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NavSearch;
