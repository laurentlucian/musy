import { HStack, IconButton, Text } from '@chakra-ui/react';

import { Element3, TextalignJustifycenter } from 'iconsax-react';

import { useFullscreenTracks } from './FullscreenTracks';

const FullscreenTracksHeader = () => {
  const { layout, setLayout, title } = useFullscreenTracks();

  return (
    <HStack py="30px" spacing={4} px={['5px']}>
      <Text fontSize="30px">{title}</Text>
      <IconButton
        aria-label="switch layouts"
        icon={layout === 'list' ? <Element3 /> : <TextalignJustifycenter />}
        onClick={() => setLayout((prev) => (prev === 'grid' ? 'list' : 'grid'))}
        variant="ghost"
        tabIndex={-1}
        color="musy.200"
      />
    </HStack>
  );
};

export default FullscreenTracksHeader;
