import type { Playlist } from '@prisma/client';

import Tiles from '../Tiles';
import PlaylistTile from './PlaylistTile';

const Playlists = ({ playlists }: { playlists: Playlist[] }) => {
  const scrollButtons = playlists.length > 5;
  const title = playlists.length > 1 ? 'PLAYLISTS' : 'PLAYLIST';

  if (!playlists.length) return null;

  return (
    <div className='stack-1'>
      <Tiles title={title} scrollButtons={scrollButtons}>
        {playlists.map((p) => {
          return <PlaylistTile key={p.id} playlist={p} />;
        })}
      </Tiles>
    </div>
  );
};

export default Playlists;
