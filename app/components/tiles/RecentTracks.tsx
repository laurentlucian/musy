import { Stack } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import Tile from '../Tile';
import Tiles from '../Tiles';

const RecentTracks = ({
  recent: initialRecent,
  currentUser,
}: {
  recent: SpotifyApi.UsersRecentlyPlayedTracksResponse | null;
  currentUser: Profile | null;
}) => {
  const recent = initialRecent?.items;
  if (!recent) return null;

  return (
    <Stack spacing={3}>
      <Tiles title="Recently played" scrollButtons={true}>
        {recent.map(({ track, played_at }) => {
          return (
            <Tile
              key={played_at}
              uri={track.uri}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              user={currentUser}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default RecentTracks;