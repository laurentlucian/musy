import { useFetcher, useSearchParams } from '@remix-run/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

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
} from '@chakra-ui/react';

import type { Track } from '@prisma/client';

import Waver from '~/components/icons/Waver';
import Tile from '~/components/Tile';
import { useMobileKeyboardActions } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';

const Explore = () => {
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

  const onBlur = () => {
    // if (search === '') {
    //   deleteSearch();
    // }
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
    <Stack bg={bg} h="100vh" alignItems="center">
      <InputGroup w="98vw">
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
      <Stack>
        {tracks?.map((track) => (
          <Tile
            key={track.id}
            trackId={track.id}
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
          />
        ))}
      </Stack>
    </Stack>
  );
};

// export const loader = async ({ request }: LoaderArgs) => {
//   const id = 'daniel.valdecantos';

//   const { spotify } = await spotifyApi(id);
//   invariant(spotify, 'No access to spotify API');
//   const url = new URL(request.url);
//   const searchURL = url.searchParams.get('spotify');
//   if (!searchURL) return typedjson({ results: null });

//   const { body: results } = await spotify.searchTracks(searchURL);
//   return typedjson({ results });
// };

export default Explore;
