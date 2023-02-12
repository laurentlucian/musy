import { useState, useEffect } from 'react';

import { useDrawerTrack } from './useDrawer';

const useBlockScrollCheck = () => {
  const [blockScrollOnMount, setBlockScrollOnMount] = useState(false);
  const track = useDrawerTrack();

  useEffect(() => {
    track ? setBlockScrollOnMount(false) : setBlockScrollOnMount(true);
  }, [track]);

  return { blockScrollOnMount };
};

export default useBlockScrollCheck;
