import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Stack } from '@chakra-ui/react';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import Card from './Card';
import Tiles from './Tiles';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const { id } = useParams();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
  const title = 'Recent';

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ played_at, track }) => {
          return (
            <Tile
              key={played_at}
              uri={track.uri}
              id={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
              duration={track.duration_ms}
              profileId={id ?? ''}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs title={title} show={show} onClose={onClose}>
        {recent.map(({ played_at, track }) => {
          return (
            <Card
              key={played_at}
              uri={track.uri}
              id={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
              duration={track.duration_ms}
              userId={id ?? ''}
            />
          );
        })}
      </ExpandedSongs>
    </Stack>
  );
};

export default RecentTracks;
