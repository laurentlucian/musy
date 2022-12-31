import { Button } from '@chakra-ui/react';
import useIsMobile from '~/hooks/useIsMobile';
import useMobileDrawerStore from '~/hooks/useMobileDrawer';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();
  const { setOpen, isOpen } = useMobileDrawerStore();
  const onClick = () => {
    setOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button aria-label="search song" variant="searchCircle" onClick={onClick}>
          +
        </Button>
      )}
    </>
  );
};

export default MobileSearchButton;
