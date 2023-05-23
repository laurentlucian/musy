import { useEffect, useRef, useState } from 'react';

import { Box, useColorModeValue } from '@chakra-ui/react';

const PlayerBar = ({ playback }: { playback: SpotifyApi.CurrentlyPlayingResponse }) => {
  const color = useColorModeValue('musy.900', 'musy.50');
  const [shouldRefresh, setToRefresh] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  useEffect(() => {
    if (shouldRefresh) {
      // refresh();
    }
  }, [shouldRefresh]);
  const progress = playback.progress_ms ?? 0;
  const duration = playback.item?.duration_ms ?? 0;
  useEffect(() => {
    const step = (timestamp: number) => {
      if (!boxRef.current) return;
      const current = progress + timestamp; // add time elapsed to always get current progress
      const percentage = (current / duration) * 100;
      if (percentage <= 100) {
        boxRef.current.style.width = `${percentage}%`;
      }
      if (percentage >= 101) {
        // 100 fetches too early?
        setToRefresh(true);
      } else {
        requestRef.current = requestAnimationFrame(step);
      }
    };
    requestRef.current && cancelAnimationFrame(requestRef.current); // reset timestamp for new track
    requestRef.current = requestAnimationFrame(step);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current);
    };
  }, [duration, progress]);
  const initial = `${(progress / duration) * 100}%`;
  return <Box ref={boxRef} h="2px" background={color} width={initial} />;
};
export default PlayerBar;
