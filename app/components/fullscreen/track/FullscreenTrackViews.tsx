import { useFullscreenTrack } from './FullscreenTrack';
import FullscreenTrackActions from './views/FullscreenTrackActions';
import FullscreenTrackComments from './views/FullscreenTrackComments';
import FullscreenTrackQueue from './views/FullscreenTrackQueue';

const FullscreenTileViews = () => {
  const { view } = useFullscreenTrack();

  if (view === 'default') return <FullscreenTrackActions />;
  if (view === 'queue') return <FullscreenTrackQueue />;
  if (view === 'comment') return <FullscreenTrackComments />;
  return null;
};

export default FullscreenTileViews;
