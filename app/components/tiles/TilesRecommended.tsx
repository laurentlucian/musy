import { useFetcher } from '@remix-run/react';
import { useState } from 'react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import { Edit, MinusCirlce, TickCircle } from 'iconsax-react';

import { useTileContext } from '~/hooks/useTileContext';
import type { TrackWithInfo } from '~/lib/types/types';

import TrackTiles from './TilesTrack';

const DeleteRecommended = () => {
  const { track } = useTileContext();
  const fetcher = useFetcher();
  const color = useColorModeValue('#161616', '#EEE6E2');

  const onClick = () => {
    fetcher.submit(
      {
        trackId: track.id,
      },
      { action: '/api/recommend/remove', method: 'POST' },
    );
  };

  return (
    <IconButton
      icon={<MinusCirlce size="25px" />}
      variant="ghost"
      aria-label="delete"
      _hover={{ color: 'white', opacity: 1 }}
      opacity={0.5}
      onClick={onClick}
      _active={{ boxShadow: 'none' }}
      color={color}
    />
  );
};

const TilesRecommended = ({ tracks }: { tracks: TrackWithInfo[] }) => {
  const [editing, setEditing] = useState(false);
  const color = useColorModeValue('#161616', '#EEE6E2');

  const actions = {
    tile: editing ? <DeleteRecommended /> : null,
    tiles: (
      <IconButton
        onClick={() => setEditing(!editing)}
        icon={!editing ? <Edit size="15px" /> : <TickCircle size="15px" />}
        variant="ghost"
        aria-label={!editing ? 'edit' : 'done'}
        _hover={{ color: 'white', opacity: 1 }}
        opacity={0.5}
        _active={{ boxShadow: 'none' }}
        color={color}
      />
    ),
  };

  return <TrackTiles tracks={tracks} title="RECOMMENDED" actions={actions} />;
};

export default TilesRecommended;
