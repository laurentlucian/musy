import { Button } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
import { ArrowDown } from 'iconsax-react';
import { useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileDrawer, useMobileDrawerActions } from '~/hooks/useMobileDrawer';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();
  const { bottom, right, icon } = useMobileDrawer();
  const { onOpen, onClose, removeFocus } = useMobileDrawerActions();
  const track = useDrawerTrack();
  const { pathname } = useLocation();
  const hideButton = track !== null || pathname.includes('/settings') ? true : false;
  const onClick = () => {
    if (icon === 'plus') onOpen();
    if (icon === 'down') removeFocus();
    if (icon === 'x') onClose();
  };

  return (
    <>
      {isMobile && (
        <Button
          aria-label="search song"
          variant="searchCircle"
          onClick={onClick}
          bottom={hideButton ? '-50px' : bottom}
          right={right}
          fontSize={icon === 'x' ? '20px' : '40px'}
          fontWeight={icon === 'plus' ? 'light' : 'hairline'}
        >
          {icon === 'x' ? '✕' : icon === 'down' ? <ArrowDown /> : '+'}
        </Button>
      )}
    </>
  );
};

export default MobileSearchButton;
