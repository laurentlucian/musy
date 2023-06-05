import { useParams } from '@remix-run/react';

import { SimpleGrid, Stack } from '@chakra-ui/react';

import Tile from '~/components/tile/Tile';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import TileTrackInfo from '~/components/tile/track/TileTrackInfo';
import TileTrackList from '~/components/tile/track/TileTrackList';

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
            image={
              <TileTrackImage
                box={{ w: ['115px', '160px', '200px'] }}
                image={{ src: track.image }}
              />
            }
            info={<TileTrackInfo track={track} />}
          />
        );
      })}
    </SimpleGrid>
  );

  const List = (
    <Stack spacing={5}>
      {tracks.map((track) => {
        return <TileTrackList key={track.id} track={track} userId={id ?? ''} />;
      })}
    </Stack>
  );

  return layout === 'grid' ? Grid : List;
};

export default FullscreenTracksLayout;
