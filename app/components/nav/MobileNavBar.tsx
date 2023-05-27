import { Link, useLocation, Form } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, IconButton, Image, useColorModeValue } from '@chakra-ui/react';

import { Home2, MusicPlaylist, SearchNormal1 } from 'iconsax-react';

import { useFullscreenTileStore } from '~/hooks/useFullscreenTileStore';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboard } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';

const MobileNavBar = () => {
  const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', 'black');
  const currentUser = useSessionUser();
  const [active, setActive] = useState<number>(
    pathname.includes('home')
      ? 0
      : pathname.includes('explore')
      ? 1
      : pathname.includes(`${currentUser?.userId}`)
      ? 2
      : 3,
  );
  const track = useFullscreenTileStore();

  const profile = currentUser?.userId;
  const { show } = useMobileKeyboard();
  const hideButton = track !== null || pathname.includes('/settings') || !show ? true : false;

  const border = useColorModeValue('musy.400', 'musy.700');
  const color = useColorModeValue('musy.500', 'musy.200');

  useEffect(() => {
    if (pathname.includes('home')) {
      setActive(0);
    } else if (pathname.includes('explore')) {
      setActive(1);
    } else if (pathname.includes(`${currentUser?.userId}`)) {
      setActive(2);
    }
  }, [pathname, currentUser?.userId]);

  const isSmallScreen = useIsMobile();
  if (!isSmallScreen) return null;

  const profileIcon = <Image src={currentUser?.image} borderRadius="full" boxSize="30px" />;

  const onClickHome = () => {
    setActive(0);
  };
  const onClickExplore = () => {
    setActive(1);
  };
  const onClickUser = () => {
    setActive(2);
  };

  return !hideButton ? (
    <Box h="90px">
      <Box
        pb="55px"
        position="fixed"
        right={0}
        left={0}
        bottom={0}
        w="100%"
        as="header"
        bg={bg}
        color={color}
        display="flex"
        borderTop="0.5px solid"
        borderColor={border}
        justifyContent="space-around"
        transition="bottom 0.25s ease-out"
        zIndex={11}
      >
        <Link to="/home" prefetch="render" onClick={onClickHome}>
          <IconButton
            aria-label="home"
            icon={<Home2 variant={active === 0 ? 'Bold' : 'Outline'} />}
            variant="mobileNav"
            color={color}
            opacity={active === 0 ? 1 : 0.4}
            pt="12px"
          />
        </Link>
        <Link to="/explore" prefetch="render" onClick={onClickExplore}>
          <IconButton
            aria-label="search"
            icon={<SearchNormal1 variant={active === 1 ? 'Bold' : 'Outline'} />}
            variant="mobileNav"
            color={color}
            opacity={active === 1 ? 1 : 0.4}
            pt="12px"
          />
        </Link>
        <Link to={`${profile}`} prefetch="render" onClick={onClickUser}>
          <IconButton
            aria-label="profile"
            icon={profileIcon}
            variant="mobileNav"
            opacity={active === 2 ? 1 : 0.4}
            pt="12px"
          />
        </Link>
      </Box>
    </Box>
  ) : null;
};

export default MobileNavBar;
