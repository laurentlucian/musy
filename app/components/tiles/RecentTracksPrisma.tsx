import { useState, useCallback } from 'react';

import { Stack } from '@chakra-ui/react';

import type { RecentSongs, Track } from '@prisma/client';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import Card from './Card';
import Tiles from './Tiles';

const RecentTracksPrisma = ({
  recent,
}: {
  recent: (RecentSongs & {
    track: Track & {
    };
  })[];
}) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
  const title = 'Recent';

  if (!recent.length) return null;

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ track }, index) => {
          return (
            <Tile
              key={index}
              uri={track.uri}
              trackId={track.id}
              image={track.image}
              albumUri={track.albumUri}
              albumName={track.albumName}
              name={track.name}
              artist={track.artist}
              artistUri={track.albumUri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.link}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs title={title} show={show} onClose={onClose}>
        {recent.map(({ track }, index) => {
          return (
            <Card
              key={index}
              uri={track.uri}
              trackId={track.id}
              image={track.image}
              albumUri={track.albumUri}
              albumName={track.albumName}
              name={track.name}
              artist={track.artist}
              artistUri={track.albumUri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.link}
            />
          );
        })}
      </ExpandedSongs>
    </Stack>
  );
};

export default RecentTracksPrisma;
