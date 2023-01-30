import { useRevalidator } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { Box, useColorModeValue } from '@chakra-ui/react';

import type { Playback, Track } from '@prisma/client';

const now = Date.now();

const PrismaPlayerbar = ({ playback }: { playback: Playback & { track: Track } }) => {
  const color = useColorModeValue('music.50', 'music.900');
  const { revalidate } = useRevalidator();
  const [shouldRefresh, setToRefresh] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (shouldRefresh) {
      revalidate();
    }
  }, [shouldRefresh, revalidate]);

  const progress = playback.progress ?? 0;
  const duration = playback.track?.duration ?? 0;

  useEffect(() => {
    const step = (timestamp: number) => {
      if (!boxRef.current) return;
      const difference = now - playback.updatedAt;
      const progress = playback.progress + difference ?? 0;
      const current = progress + timestamp; // add time elapsed to always get current progress
      const percentage = (current / duration) * 100;

      if (percentage <= 100) {
        boxRef.current.style.width = `${percentage}%`;
      }

      if (percentage >= 103) {
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
  }, [playback, duration, progress]);

  const initial = `${(progress / duration) * 100}%`;
  return <Box ref={boxRef} h="2px" background={color} width={initial} />;
};

export default PrismaPlayerbar;
