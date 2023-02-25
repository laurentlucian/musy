import type { LoaderArgs } from '@remix-run/node';
import { useParams, useSubmit } from '@remix-run/react';

import { Box } from '@chakra-ui/react';

import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Tile from '~/components/Tile';
import Tiles from '~/components/tiles/Tiles';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/$id/add';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Search = () => {
  const { results } = useTypedLoaderData<typeof loader>();
  const fetcher = useTypedFetcher<typeof action>();
  const tracks = results?.tracks?.items ?? [];
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const { id: profileId } = useParams();

  if (tracks.length === 0) return <></>;

  return (
    <Box h="60vh" zIndex={99}>
      <Tiles title="">
        {tracks?.map((track) => (
          <Tile
            key={track.id}
            layoutKey="Search"
            track={{
              albumName: track.album.name,
              albumUri: track.album.uri,
              artist: track.artists[0].name,
              artistUri: track.artists[0].uri,
              duration: track.duration_ms,
              explicit: track.explicit,
              id: track.id,
              image: track.album.images[1].url,
              link: track.external_urls.spotify,
              name: track.name,
              preview_url: track.preview_url,
              uri: track.uri,
            }}
            currentUser={currentUser}
            submit={submit}
            profileId={profileId ?? ''}
            fetcher={fetcher}
            isQueuing
          />
        ))}
      </Tiles>
    </Box>
  );
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const { id } = params;
  invariant(id, 'Missing param Id');

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'No access to spotify API');
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson({ results: null });

  const { body: results } = await spotify.searchTracks(searchURL);

  const users = await prisma.profile.findMany({ where: { name: { startsWith: searchURL } } });
  return typedjson({ results, users });
};

export default Search;
