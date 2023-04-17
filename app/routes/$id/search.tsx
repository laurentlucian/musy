import type { LoaderArgs } from '@remix-run/node';

import { Box } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import SendButton from '~/components/menu/actions/SendButton';
import Tile from '~/components/tile/Tile';
import TileImage from '~/components/tile/TileImage';
import TileInfo from '~/components/tile/TileInfo';
import Tiles from '~/components/tiles/Tiles';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Search = () => {
  const { results } = useTypedLoaderData<typeof loader>();
  const tracks = results?.tracks?.items ?? [];
  const trackz: Track[] = tracks.map((track) => {
    return {
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
      preview_url: track.preview_url ?? '',
      uri: track.uri,
    };
  });

  if (tracks.length === 0) return <></>;

  return (
    <Box h="60vh" zIndex={9}>
      <Tiles title="">
        {trackz.map((track, index) => {
          return (
            <Tile
              key={track.id}
              track={track}
              tracks={trackz}
              index={index}
              layoutKey="search"
              action={<SendButton track={track} />} // refactor search to recommend and queue
              image={<TileImage />}
              info={<TileInfo />}
            />
          );
        })}
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

  const [{ body: results }, users] = await Promise.all([
    spotify.searchTracks(searchURL),
    prisma.profile.findMany({ where: { name: { startsWith: searchURL } } }),
  ]);

  return typedjson({ results, users });
};

export default Search;
