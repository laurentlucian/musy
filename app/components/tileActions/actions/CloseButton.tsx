import { Button } from '@chakra-ui/react';

import { useDrawerActions } from '~/hooks/useDrawer';

const CloseButton = () => {
  const { onClose } = useDrawerActions();
  return (
    <Button
      variant="ghost"
      pos={['unset', 'fixed']}
      bottom="10%"
      right="50%"
      left="50%"
      onClick={onClose}
    >
      close
    </Button>
  );
};

export default CloseButton;
