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
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from '@chakra-ui/react';
import { useFetcher, useSearchParams } from '@remix-run/react';
import Waver from '../icons/Waver';
import useSessionUser from '~/hooks/useSessionUser';
import type { Track } from '~/lib/types/types';
import Tiles from '../tiles/Tiles';
import Tile from '../Tile';
import { useMouseScroll } from '~/hooks/useMouseScroll';

const NavSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);

  const currentUser = useSessionUser();
  const id = currentUser?.userId;
  const fetcher = useFetcher();
  const busy = fetcher.state === 'loading' ?? false;

  const color = useColorModeValue('#161616', '#EEE6E2');
  // const { props, scrollRef } = useMouseScroll('reverse', false); // doesnt allow mouse wheel scroll

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
    setSearch('');
    setShow(!show);
    const deleteParamDelay = setTimeout(() => {
      deleteSearch();
    }, 600);
    clearTimeout(deleteParamDelay);
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
    const deleteParamDelay = setTimeout(() => {
      deleteSearch();
    }, 600);
    clearTimeout(deleteParamDelay);
  };

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        fetcher.load(`/${id}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, fetcher.load]);

  useEffect(() => {
    const handleOpenButtonOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node) && search === '') {
        setShow(false);
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
    if (fetcher.data) {
      setTracks(
        fetcher.data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
          albumName: track.album.name,
          albumUri: track.album.uri,
          artist: track.album.artists[0].name,
          artistUri: track.artists[0].uri,
          explicit: track.explicit,
          image: track.album.images[0].url,
          link: track.external_urls.spotify,
          name: track.name,
          preview_url: track.preview_url,
          trackId: track.id,
          uri: track.uri,
        })),
      );
    }
  }, [fetcher.data]);

  return (
    <div ref={divRef}>
      <Popover
        closeOnBlur={false}
        placement="bottom"
        isOpen={search !== ''}
        autoFocus={false}
        isLazy
      >
        <PopoverTrigger>
          <InputGroup w={show ? '400px' : '30px'} transition="all 0.5s ease-in-out">
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
              placeholder="search"
              autoComplete="off"
              onChange={handleChange}
              border={show ? `solid 1px ${color}` : '#0000'}
              w={show ? '400px' : '30px'}
              transition="all 0.5s ease-in-out"
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
          w="400px"
          h="300px"
          overflowY="scroll"
          //  ref={scrollRef} //these are buggy
          //   {...props}
        >
          <PopoverBody>
            <Stack>
              {search &&
                tracks.map((track) => (
                  <Tile
                    key={track.trackId}
                    trackId={track.trackId}
                    uri={track.uri}
                    image={track.image}
                    albumUri={track.albumUri}
                    albumName={track.albumName}
                    name={track.name}
                    artist={track.artist}
                    artistUri={track.artistUri}
                    explicit={track.explicit}
                    preview_url={track.preview_url}
                    link={track.link}
                    list
                    // inDrawer
                    // isQueuing
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
