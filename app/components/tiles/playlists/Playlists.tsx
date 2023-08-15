import { Stack } from '@chakra-ui/react';

import { usePlaylists } from '~/hooks/usePlaylist';

import Tiles from '../Tiles';
import PlaylistDrawer from './PlaylistDrawer';
import PlaylistTile from './PlaylistTile';
import { Playlist } from '@prisma/client';

const Playlists = ({ playlists }: { playlists: Playlist[] }) => {
  const scrollButtons = playlists.length > 5;
  const title = playlists.length > 1 ? 'PLAYLISTS' : 'PLAYLIST';

  if (!playlists.length) return null;

  return (
    <Stack spacing={1}>
      <Tiles title={title} scrollButtons={scrollButtons}>
        {playlists.map((p) => {
          return <PlaylistTile key={p.id} playlist={p} />;
        })}
      </Tiles>
      <PlaylistDrawer />
    </Stack>
  );
};

export default Playlists;
