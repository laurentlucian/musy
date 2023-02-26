import { Button, useEventListener } from '@chakra-ui/react';

// import { useEventListener } from 'usehooks-ts';

import { useDrawerActions } from '~/hooks/useDrawer';

const CloseButton = () => {
  const { onClose } = useDrawerActions();
  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') onClose();
  });
  return (
    <Button variant="ghost" pos="fixed" bottom="10%" right="50%" left="50%" onClick={onClose}>
      close
    </Button>
  );
};

export default CloseButton;
