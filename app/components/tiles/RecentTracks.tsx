import { useState, useCallback } from 'react';
import ExpandedSongs from '../ExpandedSongs';
import { Stack } from '@chakra-ui/react';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from '../Card';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
  const title = 'Recent';

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ track, played_at }) => {
          return (
            <Tile
              key={played_at}
              uri={track.uri}
              trackId={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs title={title} show={show} onClose={onClose}>
        {recent.map(({ track, played_at }) => {
          return (
            <Card
              key={played_at}
              uri={track.uri}
              trackId={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
            />
          );
        })}
      </ExpandedSongs>
    </Stack>
  );
};

export default RecentTracks;
