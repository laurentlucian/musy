import type { Dispatch, SetStateAction } from 'react';

import { Button, useEventListener } from '@chakra-ui/react';

import { useDrawerActions } from '~/hooks/useDrawer';
import { useSetExpandedStack } from '~/hooks/useOverlay';

const CloseButton = ({ setPage }: { setPage: Dispatch<SetStateAction<[number, number]>> }) => {
  const { onClose } = useDrawerActions();
  const { removeFromStack } = useSetExpandedStack();
  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      removeFromStack(1);
      onClose();
      setPage([0, 0]);
    }
  });

  const handleClick = () => {
    onClose();
    removeFromStack(1);
    setPage([0, 0]);
  };

  return (
    <Button
      variant="mobileNav"
      pos={['unset', 'fixed']}
      bottom={['unset', '10%']}
      right={['unset', '50%']}
      left={['unset', '50%']}
      pb={['60px', 0]}
      pt={['20px', 0]}
      alignSelf="center"
      onClick={handleClick}
    >
      close
    </Button>
  );
};

export default CloseButton;
