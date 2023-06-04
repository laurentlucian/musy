import { useFullscreenTrack } from './FullscreenTrack';
import Views from './views';

const FullscreenTileViews = () => {
  const { view } = useFullscreenTrack();

  if (view === 'default') return <Views.Actions />;
  if (view === 'queue') return <Views.QueueList />;
  if (view === 'comment') return <Views.Comments />;
  return null;
};

export default FullscreenTileViews;
