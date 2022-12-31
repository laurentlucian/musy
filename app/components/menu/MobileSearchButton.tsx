import { Button } from '@chakra-ui/react';
import { ArrowDown } from 'iconsax-react';
import useDrawerStore from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import useMobileDrawerStore from '~/hooks/useMobileDrawer';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();
  const { setOpen, bottom, right, icon } = useMobileDrawerStore();
  const { track } = useDrawerStore();
  const hideButton = track !== null ? true : false;
  const onClick = () => {
    if (icon === 'plus') setOpen(true);
    if (icon === 'x') setOpen(false);
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
