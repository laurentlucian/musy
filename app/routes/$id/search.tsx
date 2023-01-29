import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import { spotifyApi } from '~/services/spotify.server';
import type { LoaderArgs } from '@remix-run/node';
import Tiles from '~/components/tiles/Tiles';
import invariant from 'tiny-invariant';
import Tile from '~/components/Tile';
import useSessionUser from '~/hooks/useSessionUser';
import { useParams, useSubmit } from '@remix-run/react';
import type { action } from '~/routes/$id/add';

const Search = () => {
  const { results } = useTypedLoaderData<typeof loader>();
  const fetcher = useTypedFetcher<typeof action>();
  const tracks = results?.tracks?.items ?? [];
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const { id } = useParams();

  if (tracks.length === 0) return <></>;

  return (
    <Tiles title="">
      {tracks?.map((track) => (
        <Tile
          key={track.id}
          trackId={track.id}
          uri={track.uri}
          image={track.album.images[1].url}
          albumUri={track.album.uri}
          albumName={track.album.name}
          name={track.name}
          artist={track.album.artists[0].name}
          artistUri={track.artists[0].uri}
          explicit={track.explicit}
          preview_url={track.preview_url}
          link={track.external_urls.spotify}
          currentUser={currentUser}
          submit={submit}
          id={id}
          fetcher={fetcher}
        />
      ))}
    </Tiles>
  );
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const { id } = params;
  invariant(id, 'Missing param Id');

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'No access to spotify API');
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson({ results: null });

  const { body: results } = await spotify.searchTracks(searchURL);
  return typedjson({ results });
};

export default Search;
