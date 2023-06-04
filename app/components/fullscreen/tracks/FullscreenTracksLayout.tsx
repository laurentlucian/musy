import { useParams } from '@remix-run/react';

import { SimpleGrid, Stack } from '@chakra-ui/react';

import Card from '~/components/tiles/Card';
import Tile from '~/components/tiles/tile/Tile';
import TileImage from '~/components/tiles/tile/TileImage';
import TileInfo from '~/components/tiles/tile/TileInfo';

import { useFullscreenTracks } from './FullscreenTracks';

const FullscreenTracksLayout = () => {
  const { layout, title, tracks } = useFullscreenTracks();
  const { id } = useParams();

  const Grid = (
    <SimpleGrid minChildWidth={['115px', '160px', '200px']} spacing="20px">
      {tracks.map((track, index) => {
        const layoutKey = title + 'Fullscreen' + index;
        return (
          <Tile
            key={track.id}
            track={track}
            tracks={tracks}
            index={index}
            layoutKey={layoutKey}
            image={<TileImage size={['115px', '160px', '200px']} />}
            info={<TileInfo />}
          />
        );
      })}
    </SimpleGrid>
  );

  const List = (
    <Stack spacing={5}>
      {tracks.map((track) => {
        return <Card key={track.id} track={track} userId={id ?? ''} />;
      })}
    </Stack>
  );

  return layout === 'grid' ? Grid : List;
};

export default FullscreenTracksLayout;
