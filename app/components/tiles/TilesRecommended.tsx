import { useFetcher } from '@remix-run/react';
import { useState } from 'react';

import { Edit, MinusCirlce, TickCircle } from 'iconsax-react';

import { useTileContext } from '~/hooks/useTileContext';
import { cn } from '~/lib/cn';
import type { TrackWithInfo } from '~/lib/types/types';

import TrackTiles from './TilesTrack';

const DeleteRecommended = () => {
  const { track } = useTileContext();
  const fetcher = useFetcher();

  const onClick = () => {
    fetcher.submit(
      {
        trackId: track.id,
      },
      { action: '/api/recommend/remove', method: 'POST' },
    );
  };

  return (
    <button
      className='flex h-10 w-10 items-center justify-center rounded-full text-white opacity-50 hover:bg-white active:shadow-none'
      onClick={onClick}
      aria-label='delete'
    >
      <MinusCirlce className='h-6 w-6' />
    </button>
  );
};

const TilesRecommended = ({ tracks }: { tracks: TrackWithInfo[] }) => {
  const [editing, setEditing] = useState(false);

  const actions = {
    tile: editing ? <DeleteRecommended /> : null,
    tiles: (
      <button
        onClick={() => setEditing(!editing)}
        className={cn(
          'flex items-center justify-center opacity-50 hover:bg-white hover:opacity-100 active:shadow-none',
          { 'bg-transparent': !editing, 'bg-white': editing },
        )}
        aria-label={editing ? 'done' : 'edit'}
      >
        {!editing ? <Edit className='h-4 w-4' /> : <TickCircle className='h-4 w-4' />}
      </button>
    ),
  };

  return <TrackTiles tracks={tracks} title='RECOMMENDED' actions={actions} />;
};

export default TilesRecommended;
