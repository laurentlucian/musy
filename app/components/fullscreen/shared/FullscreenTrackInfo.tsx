import { Box, Link, Stack } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import type { TrackWithInfo } from '~/lib/types/types';

const TrackInfo = (props: { track: TrackWithInfo }) => {
  const isSmallScreen = useIsMobile();
  const { track } = props;

  return (
    <Stack spacing={[0, 1]} flex={1} align={['center', 'start']}>
      <Link
        href={track.uri}
        fontSize={['xl', '2xl']}
        fontWeight="bold"
        textAlign={['center', 'left']}
        w="fit-content"
        wordBreak="break-all"
      >
        {track.name}
      </Link>
      <Stack spacing={[2, 1]} direction={['row', 'column']} align={['center', 'start']} px={[2, 0]}>
        <Link
          href={track.artistUri}
          color="#BBB8B7"
          fontSize={['11px', '13px']}
          whiteSpace="nowrap"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {track.artist}
        </Link>
        {isSmallScreen && <Box opacity={0.6}>•</Box>}
        <Link
          href={track.albumUri}
          noOfLines={1}
          onClick={(e) => {
            e.stopPropagation();
          }}
          color="#BBB8B7"
          fontSize={['11px', '13px']}
        >
          {track.albumName}
        </Link>
      </Stack>
    </Stack>
  );
};

export default TrackInfo;
