import Tile from '~/components/Tile';
import TileImage from '~/components/TileImage';
import TileInfo from '~/components/TileInfo';
import { useExplore } from '~/hooks/useExplore';

const ExploreTracks = () => {
  const { data, search, setSearch, setTracks, tracks } = useExplore();
  return tracks?.map((track, index) => (
    <Tile
      key={track.id}
      layoutKey={'Explore' + index}
      track={track}
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
      info={<TileInfo index={index} layoutKey={'Explorei' + index} track={track} tracks={tracks} />}
    />
  ));
};

export default ExploreTracks;
