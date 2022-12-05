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
import { Form, useSearchParams, useSubmit, useTransition } from '@remix-run/react';
import { CloseSquare } from 'iconsax-react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { spotifyApi } from '~/services/spotify.server';
import Tiles from '~/components/Tiles';
import { authenticator } from '~/services/auth.server';
import invariant from 'tiny-invariant';
import type { TypedMetaFunction } from 'remix-typedjson';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { Link } from '@remix-run/react';
import Tooltip from '~/components/Tooltip';
import explicitImage from '~/assets/explicit-solid.svg';
import { Outlet } from '@remix-run/react';

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
    <Stack spacing={5}>
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
                  <Image
                    src={track.album.images[0].url}
                    borderRadius={5}
                    w="200px"
                    draggable={false}
                  />
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
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson(null);
  if (!session) {
    redirect('/auth/spotify?returnTo=/analysis?spotify=' + searchURL);
    return typedjson(null);
  }

  const { user: currentUser } = session;
  invariant(currentUser, 'Missing user');

  const { spotify } = await spotifyApi(currentUser.id);
  invariant(spotify, 'No access to spotify API');

  const {
    body: { tracks },
  } = await spotify.searchTracks(searchURL);

  const results = tracks?.items;
  return typedjson(results);
};

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Musy Analysis',
      description: `Musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
    };
  }

  const track = data[0];

  return {
    title: `${track.name} | Musy Analysis`,
    description: `Musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
  };
};

export default Analysis;
