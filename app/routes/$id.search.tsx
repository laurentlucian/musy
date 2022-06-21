import { spotifyApi } from '~/services/spotify.server';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { HStack, Image, Input, Stack, Text, VStack } from '@chakra-ui/react';

const Search = () => {
  const response = useLoaderData<SpotifyApi.TrackSearchResponse | null>();
  const submit = useSubmit();
  const tracks = response?.tracks.items ?? [];

  return (
    <Stack height={['100vh']} width={['100%']}>
      <Form method="get">
        <Input
          type="search"
          id="search"
          name="spotify"
          placeholder="songs"
          onChange={(e) => submit(e.currentTarget.form)}
          h="30px"
        />
      </Form>
      {tracks?.map((track) => (
        <VStack key={track.id} align="flex-start" py="3px">
          <HStack justify="flex-start">
            <Image src={track.album.images[1].url} boxSize="50px" />
            <VStack align="flex-start" justify="flex-start">
              <Text fontSize="13px">{track.name}</Text>
              <Text fontSize="13px">{track.artists[0].name}</Text>
            </VStack>
          </HStack>
        </VStack>
      ))}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const { spotify } = await spotifyApi(id);
  if (!spotify) return null;
  const url = new URL(request.url);
  const search = url.searchParams.get('spotify');
  if (!search) return null;

  const { body: searchTrack } = await spotify.searchTracks(search);

  return searchTrack;
};

export default Search;
