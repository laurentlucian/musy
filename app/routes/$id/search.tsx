import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import type { Profile } from '@prisma/client';

import { spotifyApi } from '~/services/spotify.server';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import { getCurrentUser } from '~/services/auth.server';

type SearchType = {
  results: SpotifyApi.TrackSearchResponse | null;
  user: Profile | null;
  currentUser: Profile | null;
};

const Search = () => {
  const { results, user, currentUser } = useLoaderData<SearchType>();
  const tracks = results?.tracks?.items ?? [];

  if (tracks.length === 0) return <></>;

  return (
    <Tiles>
      {tracks?.map((track) => (
        <Tile
          key={track.id}
          uri={track.uri}
          image={track.album.images[1].url}
          albumUri={track.album.uri}
          albumName={track.album.name}
          name={track.name}
          artist={track.album.artists[0].name}
          artistUri={track.artists[0].uri}
          explicit={track.explicit}
          sendTo={user?.name}
          user={currentUser}
        />
      ))}
    </Tiles>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const currentUser = await getCurrentUser(request);

  try {
    const { spotify, user } = await spotifyApi(id);
    if (!spotify) return json('No access to spotify API', { status: 500 });
    const url = new URL(request.url);
    const searchURL = url.searchParams.get('spotify');
    if (!searchURL) return json({ results: null, user: null, currentUser });

    const { body: results } = await spotify.searchTracks(searchURL);
    return json({ results, user, currentUser });
  } catch {
    // @todo handle if spotify search error
    return json({ results: null, user: null, currentUser });
  }
};

export default Search;
