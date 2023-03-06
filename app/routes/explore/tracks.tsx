import Tile from '~/components/Tile';
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
    />
  ));
};

export default ExploreTracks;
