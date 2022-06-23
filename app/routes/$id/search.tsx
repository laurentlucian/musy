import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';

import { spotifyApi } from '~/services/spotify.server';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';

const Search = () => {
  const response = useLoaderData<SpotifyApi.TrackSearchResponse | null>();
  const tracks = response?.tracks?.items ?? [];

  return (
    <Tiles>
      {tracks?.map((track) => (
        <Tile
          key={track.id}
          uri={track.uri}
          image={track.album.images[1].url}
          name={track.name}
          artist={track.album.artists[0].name}
        />
      ))}
    </Tiles>
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

export default Search;
