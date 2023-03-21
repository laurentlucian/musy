import type { LoaderArgs } from '@remix-run/node';
import { useMemo } from 'react';

import { Box } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import SendButton from '~/components/menu/actions/SendButton';
import Tile from '~/components/Tile';
import TileImage from '~/components/TileImage';
import TileInfo from '~/components/TileInfo';
import Tiles from '~/components/tiles/Tiles';
import type { Track } from '~/lib/types/types';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Search = () => {
  const { results } = useTypedLoaderData<typeof loader>();

  const tracks: Track[] = useMemo(() => {
    const tracks = results?.tracks?.items ?? [];

    return tracks.map((track) => {
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
  }, [results?.tracks?.items]);

  if (tracks.length === 0) return <></>;

  return (
    <Box h="60vh" zIndex={9}>
      <Tiles title="">
        {tracks.map((track, index) => {
          return (
            <Tile
              key={track.id}
              track={track}
              tracks={tracks}
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

  const { body: results } = await spotify.searchTracks(searchURL);

  const users = await prisma.profile.findMany({ where: { name: { startsWith: searchURL } } });
  return typedjson({ results, users });
};

export default Search;
