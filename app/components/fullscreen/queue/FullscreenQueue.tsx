import { Box, Stack } from '@chakra-ui/react';

import SearchInput from '~/components/search/SearchInput';

import FullscreenQueueTracks from './FullscreenQueueTracks';

const FullscreenQueue = (props: { userId: string }) => {
  return (
    <Stack w="100%" align="center">
      <SearchInput
        flexShrink={0}
        param="fullscreen"
        w={['100%']}
        maxW={['unset', '800px']}
        mt={['2px', '10px', '50px']}
        autoFocus
      />
      <Box overflowX="hidden" w="100%">
        <FullscreenQueueTracks userId={props.userId} />
      </Box>
    </Stack>
  );
};

export default FullscreenQueue;
