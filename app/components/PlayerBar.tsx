import { Progress, useColorModeValue, useInterval } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useDataRefresh } from 'remix-utils';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';

const PlayerBar = ({
  playback,
}: {
  playback: CurrentlyPlayingObjectCustom | SpotifyApi.CurrentlyPlayingResponse;
}) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const color = useColorModeValue('music.900', 'music.50');
  const { refresh } = useDataRefresh();
  const refreshed = useRef(false);

  const [current, setCurrent] = useState(0);

  const active = playback.is_playing;
  const duration = playback.item?.duration_ms ?? 0;
  const progress = playback.progress_ms ?? 0;
  const percentage = duration ? (current / duration) * 100 : 0;

  useEffect(() => {
    setCurrent(progress);
    refreshed.current = false;
  }, [progress]);

  // simulating a seek bar tick
  useInterval(
    () => {
      if (!duration) return null;
      // ref prevents from refreshing again before new data has hydrated; might loop otherwise
      if (current > duration && !refreshed.current) {
        refresh();
        refreshed.current = true;
      }
      setCurrent((prev) => prev + 1000);
    },
    active ? 1000 : null,
  );
  return (
    <Progress
      sx={{
        backgroundColor: bg,
        '> div': {
          backgroundColor: color,
        },
      }}
      borderBottomLeftRadius={2}
      borderBottomRightRadius={2}
      h="2px"
      value={percentage}
    />
  );
};

export default PlayerBar;
