import { type Dispatch, type SetStateAction } from 'react';

import { useFullscreenTileTrack } from '~/hooks/useFullscreenTileStore';

import { useFullscreenTileView } from '../Wrapper';
import Views from './views';

const FullscreenTileActions = ({
  page,
  playing,
  setPlaying,
}: {
  page: number;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const { view } = useFullscreenTileView();
  const track = useFullscreenTileTrack(page);

  if (view === 'default') return <Views.Default track={track} play={{ playing, setPlaying }} />;
  if (view === 'queue') return <Views.QueueList trackId={track.id} />;
  if (view === 'comment') return <Views.Comments track={track} />;
  return null;
};

export default FullscreenTileActions;
