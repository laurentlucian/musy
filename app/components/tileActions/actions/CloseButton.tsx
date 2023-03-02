import type { Dispatch, SetStateAction } from 'react';

import { Button, useEventListener } from '@chakra-ui/react';

// import { useEventListener } from 'usehooks-ts';

import { useDrawerActions } from '~/hooks/useDrawer';

const CloseButton = ({ setPage }: { setPage: Dispatch<SetStateAction<[number, number]>> }) => {
  const { onClose } = useDrawerActions();
  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') onClose();
  });
  const handleClick = () => {
    onClose();
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
