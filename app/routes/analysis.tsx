import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Form, useSearchParams, useSubmit, useNavigation, Link, Outlet } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useRef, useEffect, useState } from 'react';

import {
  Flex,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';

import { CloseSquare } from 'iconsax-react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Tiles from '~/components/tiles/Tiles';
import Tooltip from '~/components/Tooltip';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import { getSpotifyClient } from '~/services/spotify.server';

const Analysis = () => {
  const results = useTypedLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const transition = useNavigation();
  const busy = transition.formData?.has('spotify') ?? false;

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        console.log('ref.current', ref.current);
        submit(ref.current);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, submit]);

  const clearSearch = () => {
    setSearch('');
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
      clearSearch();
    }
  };

  return (
    <Stack spacing={5} h="100%">
      <Form ref={ref} method="get">
        <Flex flex={1} mb={0} align="center">
          <InputGroup>
            <Input
              name="spotify"
              variant="flushed"
              size="sm"
              value={search}
              placeholder="Search for a song"
              autoComplete="off"
              borderRadius={0}
              onChange={onChange}
              fontSize="15px"
            />
            {search && (
              <InputRightElement
                h="35px"
                w="65px"
                pr={2}
                justifyContent="end"
                children={
                  <>
                    {busy && <Spinner size="xs" mr={2} />}
                    <IconButton
                      aria-label="close"
                      variant="ghost"
                      size="xs"
                      borderRadius={8}
                      onClick={() => {
                        setSearch('');
                        searchParams.delete('spotify');
                        setSearchParams(searchParams, {
                          replace: true,
                          state: { scroll: false },
                        });
                      }}
                      icon={<CloseSquare />}
                    />
                  </>
                }
              />
            )}
          </InputGroup>
        </Flex>
      </Form>
      <Tiles>
        {results &&
          results.map((track) => (
            <Stack
              key={track.id}
              as={Link}
              to={`/analysis/${track.id}`}
              onClick={clearSearch}
              flex="0 0 200px"
            >
              <Flex direction="column">
                <Tooltip label={track.album.name} placement="top-start">
                  <Image src={track.album.images[0].url} w="200px" draggable={false} />
                </Tooltip>
              </Flex>
              <Flex justify="space-between">
                <Stack spacing={0}>
                  <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-all">
                    {track.name}
                  </Text>
                  <Flex align="center">
                    {track.explicit && <Image src={explicitImage} mr={1} w="19px" />}
                    <Text fontSize="11px" opacity={0.8}>
                      {track.artists[0].name}
                    </Text>
                  </Flex>
                </Stack>
              </Flex>
            </Stack>
          ))}
      </Tiles>
      <Outlet />
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson(null);

  const { spotify } = await getSpotifyClient('1295028670');
  invariant(spotify, 'No access to spotify API');

  const {
    body: { tracks },
  } = await spotify.searchTracks(searchURL).catch((err) => {
    throw typedjson([], { status: err.statusCode });
  });

  const results = tracks?.items;
  return typedjson(results);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data || data.length === 0) {
    return [
      {
        title: 'musy Analysis',
      },
      {
        description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
      },
    ];
  }

  const track = data[0];

  return [
    {
      title: `${track?.name} | musy Analysis`,
    },
    {
      description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
    },
  ];
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Analysis;
