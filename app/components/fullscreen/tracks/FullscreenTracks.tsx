import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import type { TrackWithInfo } from '~/lib/types/types';

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
    <FullscreenTracksContext.Provider value={{ layout, setLayout, title, tracks }}>
      <Stack w="100%">
        <FullscreenTracksHeader />
        <Stack overflowX="hidden">
          <FullscreenTracksLayout />
        </Stack>
      </Stack>
    </FullscreenTracksContext.Provider>
  );
};

export default FullscreenTracks;
