import type { Dispatch, SetStateAction } from 'react';

import { Button, useEventListener } from '@chakra-ui/react';

import { useFullscreenActions } from '~/hooks/useFullscreenTileStore';
import { useSetExpandedStack } from '~/hooks/useOverlay';

const CloseButton = ({
  setPage,
  setPlaying,
}: {
  setPage: Dispatch<SetStateAction<[number, number]>>;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const { onClose } = useFullscreenActions();
  const { removeFromStack } = useSetExpandedStack();
  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      removeFromStack(1);
      onClose();
      setPage([0, 0]);
      setPlaying(false);
    }
  });

  const handleClick = () => {
    onClose();
    removeFromStack(1);
    setPage([0, 0]);
    setPlaying(false);
  };

  return (
    <Button
      variant="mobileNav"
      pos={['unset', 'fixed']}
      bottom={['unset', '10%']}
      right={['unset', '50%']}
      left={['unset', '50%']}
      pb={['30px', 0]}
      pt={['20px', 0]}
      alignSelf="center"
      color="musy.200"
      _hover={{ color: 'white' }}
      onClick={handleClick}
      zIndex={1}
    >
      Close
    </Button>
  );
};

export default CloseButton;