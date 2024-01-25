import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

import type { TrackWithInfo } from '~/lib/types/types';

import FullscreenFadeLayout from '../shared/FullscreenFadeLayout';
import FullscreenTrackHeader from './FullscreenTrackHeader';
import FullscreenTrackViews from './FullscreenTrackViews';

type ViewsTypes = 'default' | 'queue' | 'comment';

export const FullscreenTrackContext = createContext<{
  originUserId?: string;
  setView: Dispatch<SetStateAction<ViewsTypes>>;
  track: TrackWithInfo;
  view: ViewsTypes;
} | null>(null);

export const useFullscreenTrack = () => {
  const context = useContext(FullscreenTrackContext);
  if (!context) {
    throw new Error('Must be a child of FullscreenTrack to useFullscreenTrack');
  }
  return context;
};

const FullscreenTrack = (props: {
  originUserId?: string;
  track: TrackWithInfo;
}) => {
  const [view, setView] = useState<ViewsTypes>('default');
  const { originUserId, track } = props;

  return (
    <FullscreenTrackContext.Provider value={{ originUserId, setView, track, view }}>
      <FullscreenFadeLayout>
        <div className='grid grid-cols-1 content-start overflow-hidden md:grid-cols-2 md:content-center'>
          <FullscreenTrackHeader />
          <FullscreenTrackViews />
        </div>
      </FullscreenFadeLayout>
    </FullscreenTrackContext.Provider>
  );
};

export default FullscreenTrack;
