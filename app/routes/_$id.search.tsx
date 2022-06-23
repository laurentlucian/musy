import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useParams, useSubmit, useTransition } from '@remix-run/react';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import {
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { Back } from 'iconsax-react';

import { spotifyApi } from '~/services/spotify.server';
import SearchItem from '~/components/SearchItem';

const Search = () => {
  const response = useLoaderData<SpotifyApi.TrackSearchResponse | null>();
  const transition = useTransition();
  const { id } = useParams();
  const submit = useSubmit();
  const isLoading = transition.state === 'submitting';
  console.log('transition.state', transition.state);
  const tracks = response?.tracks?.items ?? [];

  return (
    <Stack spacing={4} height={['100vh']} width={['100%']}>
      <HStack>
        <IconButton
          aria-label="back"
          as={Link}
          to={`/${id}`}
          icon={transition.state === 'loading' ? <Spinner size="sm" /> : <Back />}
          variant="ghost"
        />
        <Flex as={Form} method="get" flex={1}>
          <InputGroup>
            <Input
              name="spotify"
              h="30px"
              placeholder="nectar, kendrick lamar, etc"
              onChange={(e) => submit(e.currentTarget.form)}
              fontSize="15px"
              w="287.87px"
            />
            {isLoading && <InputRightElement h="30px" children={<Spinner size="xs" />} />}
          </InputGroup>
        </Flex>
      </HStack>
      <Stack spacing={4}>
        {tracks?.map((track) => (
          <SearchItem
            key={track.id}
            uri={track.uri}
            name={track.name}
            image={track.album.images[1].url}
            artist={track.artists[0].name}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('No access to spotify API', { status: 500 });
  const url = new URL(request.url);
  const search = url.searchParams.get('spotify');
  if (!search) return json([]);

  const { body: searchTrack } = await spotify.searchTracks(search);
  // @todo handle if spotify search error
  return json(searchTrack);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const data = await request.formData();
  const { track } = Object.fromEntries(data);
  const uri = track.valueOf() as string;

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('No access to spotify API', { status: 500 });
  const res = await spotify.addToQueue(uri);
  if (res.statusCode !== 204) return json("Couldn't add to queue", { status: res.statusCode });

  return json('Success');
};

export default Search;
