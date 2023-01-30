import { useColorModeValue, keyframes, Box, useTimeout } from '@chakra-ui/react';
import type { Playback, Track } from '@prisma/client';
import useNow from '~/hooks/useNow';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';

const PlayerBarCSS = ({ playback }: { playback: Playback & { track: Track } }) => {
  const setShouldRevalidate = useRevalidatorStore((state) => state.setShouldRevalidate);
  const color = useColorModeValue( 'music.900','music.50');
  const now = useNow();

  const difference = now - playback.updatedAt;
  const progress = playback.progress + difference ?? 0;
  const duration = playback.track?.duration ?? 0;
  const percentage = (progress / duration) * 100;
  const remaining = duration - progress;

  useTimeout(() => setShouldRevalidate({ userId: playback.userId }), remaining + 1500);

  const bar = keyframes`
  0% {
    width: ${percentage}%;
  }
  100% {
    width: 100%;
  }
  `;

  const animation = `${bar} ${remaining}ms linear forwards`;

  return <Box animation={animation} h="2px" background={color} />;
};
export default PlayerBarCSS;
