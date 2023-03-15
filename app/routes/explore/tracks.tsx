import Tile from '~/components/Tile';
import TileImage from '~/components/TileImage';
import { useExplore } from '~/hooks/useExplore';

const ExploreTracks = () => {
  const { data, search, setSearch, setTracks, tracks } = useExplore();
  return tracks?.map((track, index) => (
    <Tile
      key={track.id}
      layoutKey={'Explore' + index}
      track={track}
      tracks={tracks}
      index={index}
      list
      image={
        <TileImage
          src={track.image}
          index={index}
          layoutKey={'Explore' + index}
          track={track}
          tracks={tracks}
          size={'40px'}
        />
      }
    />
  ));
};

export default ExploreTracks;
