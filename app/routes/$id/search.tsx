import type { LoaderArgs } from '@remix-run/node';

import { Box } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import SendButton from '~/components/fullscreen/shared/SendButton';
import Tile from '~/components/tiles/tile/Tile';
import TileImage from '~/components/tiles/tile/TileImage';
import TileInfo from '~/components/tiles/tile/TileInfo';
import Tiles from '~/components/tiles/Tiles';
import { getSearchResults } from '~/services/prisma/spotify.server';

const SearchOutlet = () => {
  const { tracks, users } = useTypedLoaderData<typeof loader>();

  if (tracks.length === 0) return <></>;

  return (
    <Box h="60vh" zIndex={9}>
      <Tiles title="" tracks={tracks}>
        {tracks.map((track, index) => {
          return (
            <Tile
              key={track.id}
              track={track}
              tracks={tracks}
              index={index}
              layoutKey="search"
              action={<SendButton trackId={track.id} />} // refactor search to recommend and queue
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

  const { tracks, users } = await getSearchResults({
    param: 'profile',
    url: new URL(request.url),
    userId: id,
  });

  return typedjson({ tracks, users });
};

export default SearchOutlet;
