import { useState, useEffect } from 'react';

import { extendTheme } from '@chakra-ui/react';

import { useDrawerTrack } from './useDrawer';

const useBlockScrollCheck = (theme: Record<string, any>) => {
  const [blockScrollOnMount, setBlockScrollOnMount] = useState(false);
  const track = useDrawerTrack();

  useEffect(() => {
    track ? setBlockScrollOnMount(true) : setBlockScrollOnMount(false);
  }, [track]);

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

export default useBlockScrollCheck;
