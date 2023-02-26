import { useState, useEffect } from 'react';

import { extendTheme } from '@chakra-ui/react';

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import { useDrawerTrack } from './useDrawer';

const usePickerStore = create<{ pickers: boolean; setPickers: (by: boolean) => void }>((set) => ({
  pickers: false,
  setPickers: (by) => set({ pickers: by }),
}));
const usePickerValue = () => usePickerStore((state) => state.pickers, shallow);
export const useSetPicker = () => usePickerStore((state) => state.setPickers);
export const useBlockScrollCheck = (theme: Record<string, any>) => {
  const [blockScrollOnMount, setBlockScrollOnMount] = useState(false);
  const track = useDrawerTrack();
  const pickers = usePickerValue();

  useEffect(() => {
    track || pickers ? setBlockScrollOnMount(true) : setBlockScrollOnMount(false);
  }, [track, pickers]);

  const blockScroll = {
    global: {
      'html, body': {
        overflow: 'hidden',
      },
    },
  };
  const newTheme = extendTheme(theme, { styles: blockScroll });

  return { newTheme, shouldBlock: blockScrollOnMount };
};
