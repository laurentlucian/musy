import Tile from '~/components/tile/Tile';
import TileImage from '~/components/tile/TileImage';
import TileInfo from '~/components/tile/TileInfo';
import { useExplore } from '~/hooks/useExplore';

const ExploreTracks = () => {
  const { data, search, setSearch, setTracks, tracks } = useExplore();
  return tracks?.map((track, index) => {
    const layoutKey = 'Explore' + index;
    return (
      <Tile
        key={track.id}
        track={track}
        tracks={tracks}
        index={index}
        layoutKey={layoutKey}
        image={<TileImage size={'40px'} />}
        info={<TileInfo />}
        list
      />
    );
  });
};

export default ExploreTracks;
