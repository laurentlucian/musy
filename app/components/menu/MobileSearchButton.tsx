import { Button } from '@chakra-ui/react';
import useDrawerStore from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import useMobileDrawerStore from '~/hooks/useMobileDrawer';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();
  const { setOpen, isOpen } = useMobileDrawerStore();
  const { track } = useDrawerStore();
  const hideButton = track !== null ? true : false;
  const onClick = () => {
    setOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          aria-label="search song"
          variant="searchCircle"
          onClick={onClick}
          bottom={hideButton ? '-50px' : 3}
        >
          +
        </Button>
      )}
    </>
  );
};

export default MobileSearchButton;
