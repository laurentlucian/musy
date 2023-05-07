import type { LoaderArgs } from '@remix-run/node';
import { Form, useCatch, useSearchParams, useSubmit, useTransition } from '@remix-run/react';
import { Link } from '@remix-run/react';
import { Outlet } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import {
  Flex,
  Heading,
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
import type { TypedMetaFunction } from 'remix-typedjson';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Tiles from '~/components/profile/tiles/Tiles';
import Tooltip from '~/components/Tooltip';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import { spotifyApi } from '~/services/spotify.server';

const Analysis = () => {
  const results = useTypedLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const transition = useTransition();
  const busy = transition.submission?.formData.has('spotify') ?? false;

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
                  <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
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

  const { spotify } = await spotifyApi('1295028670');
  invariant(spotify, 'No access to spotify API');

  const {
    body: { tracks },
  } = await spotify.searchTracks(searchURL).catch((err) => {
    throw typedjson([], { status: err.statusCode });
  });

  const results = tracks?.items;
  return typedjson(results);
};

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  if (!data || data.length === 0) {
    return {
      description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
      title: 'musy Analysis',
    };
  }

  const track = data[0];

  return {
    description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
    title: `${track?.name} | musy Analysis`,
  };
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log('index -> ErrorBoundary', error);

  return (
    <>
      <Heading fontSize={['sm', 'md']}>Oops, unhandled error</Heading>
      <Text fontSize="sm">Trace(for debug): {error.message}</Text>
    </>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Oops, you shouldn&apos;t be here (No access)</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn&apos;t be here (Page doesn&apos;t exist)</Text>;
      break;
    case 429:
      message = <Text>Oops, API suspended (too many requests)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['sm', 'md']}>
        {caught.status} {caught.statusText}
      </Heading>
      <Text fontSize="sm">{message}</Text>
    </>
  );
};

export default Analysis;
