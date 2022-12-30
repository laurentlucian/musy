import { IconButton } from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import useIsMobile from '~/hooks/useIsMobile';

const MobileSearchButton = () => {
  const isMobile = useIsMobile();

  return (
    <>{isMobile && <IconButton aria-label="search song" variant="searchCircle" icon={<Add />} />}</>
  );
};

export default MobileSearchButton;
