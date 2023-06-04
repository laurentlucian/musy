import { useState } from 'react';

import { HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import { Speaker, TickCircle } from 'iconsax-react';

const InteractButtons = () => {
  const [playing, setPlaying] = useState(false);
  const color = useColorModeValue('#161616', '#EEE6E2');
  return (
    <HStack spacing={5}>
      <IconButton
        // onClick={() => setEditing(!editing)}
        icon={!playing ? <Speaker size="15px" /> : <TickCircle size="15px" />}
        variant="ghost"
        aria-label={'preview'}
        _hover={{ color: 'white', opacity: 1 }}
        opacity={0.5}
        _active={{ boxShadow: 'none' }}
        color={color}
      />
    </HStack>
  );
};

export default InteractButtons;
