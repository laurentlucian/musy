import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

import type { TrackWithInfo } from '~/lib/types/types';

import FullscreenFadeLayout from '../shared/FullscreenFadeLayout';
import FullscreenTracksHeader from './FullscreenTracksHeader';
import FullscreenTracksLayout from './FullscreenTracksLayout';

type LayoutTypes = 'grid' | 'list';

export const FullscreenTracksContext = createContext<{
  layout: LayoutTypes;
  setLayout: Dispatch<SetStateAction<LayoutTypes>>;
  title: string;
  tracks: TrackWithInfo[];
} | null>(null);

export const useFullscreenTracks = () => {
  const context = useContext(FullscreenTracksContext);
  if (!context) {
    throw new Error('Must be a child of FullscreenTracks to useFullscreenTracks');
  }
  return context;
};

const FullscreenTracks = (props: { title: string; tracks: TrackWithInfo[] }) => {
  const { title, tracks } = props;
  const [layout, setLayout] = useState<LayoutTypes>('grid');

  return (
    <FullscreenFadeLayout>
      <FullscreenTracksContext.Provider value={{ layout, setLayout, title, tracks }}>
        <div className='stack-2 w-full'>
          <FullscreenTracksHeader />
          <div className='stack-2 overflow-x-hidden'>
            <FullscreenTracksLayout />
          </div>
        </div>
      </FullscreenTracksContext.Provider>
    </FullscreenFadeLayout>
  );
};

export default FullscreenTracks;
