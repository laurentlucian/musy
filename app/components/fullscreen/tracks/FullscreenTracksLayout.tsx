import { SimpleGrid, Stack } from '@chakra-ui/react';

import Tile from '~/components/tile/Tile';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import TileTrackInfo from '~/components/tile/track/TileTrackInfo';
import TileTrackList from '~/components/tile/track/TileTrackList';

import { useFullscreenTracks } from './FullscreenTracks';

const FullscreenTracksLayout = () => {
  const { layout, tracks } = useFullscreenTracks();

  const Grid = (
    <SimpleGrid minChildWidth={['115px', '160px', '200px']} spacing='20px'>
      {tracks.map((track, index) => {
        return (
          <Tile
            key={index}
            image={
              <TileTrackImage
                box='w-[115px] md:w-[160px] lg:w-[200px]'
                fullscreen={{ track }}
                image={{
                  src: track.image,
                }}
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
        return (
          <TileTrackList
            key={track.id}
            image={
              <TileTrackImage
                fullscreen={{
                  track,
                }}
                box='w-[65px] md:w-[70px]'
                image={{
                  src: track.image,
                }}
              />
            }
            track={track}
          />
        );
      })}
    </Stack>
  );

  return layout === 'grid' ? Grid : List;
};

export default FullscreenTracksLayout;
