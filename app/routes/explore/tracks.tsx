import Tile from '~/components/Tile';
import TileImage from '~/components/TileImage';
import TileInfo from '~/components/TileInfo';
import { useExplore } from '~/hooks/useExplore';

const ExploreTracks = () => {
  const { data, search, setSearch, setTracks, tracks } = useExplore();
  return tracks?.map((track, index) => {
    const layoutKey = 'Explore' + index;
    return (
      <Tile
        key={track.id}
        list
        image={
          <TileImage
            index={index}
            layoutKey={layoutKey}
            track={track}
            tracks={tracks}
            size={'40px'}
          />
        }
        info={<TileInfo index={index} layoutKey={layoutKey} track={track} tracks={tracks} />}
      />
    );
  });
};

export default ExploreTracks;
