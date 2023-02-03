import { useLocation } from '@remix-run/react';

import { Button, useColorModeValue } from '@chakra-ui/react';

import { ArrowDown } from 'iconsax-react';

import { useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileDrawer, useMobileDrawerActions } from '~/hooks/useMobileDrawer';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();
  const { bottom, icon, right } = useMobileDrawer();
  const { onClose, onOpen, removeFocus } = useMobileDrawerActions();
  const track = useDrawerTrack();
  const { pathname } = useLocation();
  const hideButton = track !== null || pathname.includes('/settings') ? true : false;
  const onClick = () => {
    if (icon === 'plus') onOpen();
    if (icon === 'down') removeFocus();
    if (icon === 'x') onClose();
  };
  const bg = useColorModeValue('music.200', 'music.700');
  const color = useColorModeValue('music.700', 'music.200');
  return (
    <>
      {isMobile && (
        <Button
          bg={bg}
          color={color}
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
