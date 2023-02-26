import { Link, useLocation, Form } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, IconButton, Image, useColorModeValue } from '@chakra-ui/react';

import { Home2, MusicPlaylist, Profile2User, SearchNormal1 } from 'iconsax-react';

import { useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboard } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';
import { AnimatePresence } from 'framer-motion';

const MobileNavBar = () => {
  const { pathname } = useLocation();
  const currentUser = useSessionUser();
  const [active, setActive] = useState<number>(
    pathname.includes('home')
      ? 0
      : pathname.includes('friend')
      ? 1
      : pathname.includes('sessions')
      ? 2
      : pathname.includes('explore')
      ? 3
      : pathname.includes(`${currentUser?.userId}`)
      ? 4
      : 5,
  );
  const isMobile = useIsMobile();
  const track = useDrawerTrack();

  const profile = currentUser?.userId;
  const { show } = useMobileKeyboard();
  const hideButton = track !== null || pathname.includes('/settings') || !show ? true : false;

  const bg = useColorModeValue('music.200', 'music.500');
  const color = useColorModeValue('music.500', 'music.200');

  useEffect(() => {
    if (pathname.includes('home')) {
      setActive(0);
    } else if (pathname.includes('friends')) {
      setActive(1);
    } else if (pathname.includes('sessions')) {
      setActive(2);
    } else if (pathname.includes('explore')) {
      setActive(3);
    } else if (pathname.includes(`${currentUser?.userId}`)) {
      setActive(4);
    }
  }, [pathname, currentUser?.userId]);

  const profileIcon = <Image src={currentUser?.image} borderRadius="full" boxSize="30px" />;
  const logInIcon = <Image src={'/favicon-32x32.png'} borderRadius="full" boxSize="30px" />;

  const onClickHome = () => {
    setActive(0);
  };
  const onClickFriends = () => {
    setActive(1);
  };
  const onClickSessions = () => {
    setActive(2);
  };
  const onClickExplore = () => {
    setActive(3);
  };
  const onClickUser = () => {
    setActive(4);
  };

  return (
    <AnimatePresence>
      {!hideButton && (
        <Box
          pos="fixed"
          bg={bg}
          w="100vw"
          h="90px"
          borderRadius="20px"
          borderBottomRadius={0}
          color={color}
          aria-label="search song"
          bottom='0%'
          display="flex"
          justifyContent="space-around"
          transition="bottom 0.25s ease-out"
          overflow="hidden"
          zIndex={9}
        >
          <Link to="/home" prefetch="render" onClick={onClickHome}>
            <IconButton
              aria-label="home"
              icon={<Home2 variant={active === 0 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 0 ? 1 : 0.4}
              pt="12px"
            />
          </Link>
          <Link to="/friends" prefetch="render" onClick={onClickFriends}>
            <IconButton
              aria-label="friends"
              icon={<Profile2User variant={active === 1 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 1 ? 1 : 0.4}
              pt="12px"
            />
          </Link>
          <Link to="/sessions" prefetch="render" onClick={onClickSessions}>
            <IconButton
              aria-label="sessions"
              icon={<MusicPlaylist variant={active === 2 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 2 ? 1 : 0.4}
              pt="12px"
            />
          </Link>
          <Link to="/explore" prefetch="render" onClick={onClickExplore}>
            <IconButton
              aria-label="search"
              icon={<SearchNormal1 variant={active === 3 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 3 ? 1 : 0.4}
              pt="12px"
            />
          </Link>
          {currentUser ? (
            <Link to={`${profile}`} prefetch="render" onClick={onClickUser}>
              <IconButton
                aria-label="profile"
                icon={profileIcon}
                variant="mobileNav"
                opacity={active === 4 ? 1 : 0.4}
                pt="12px"
              />
            </Link>
          ) : (
            <Form action={'/auth/spotify?returnTo=' + pathname} method="post">
              <IconButton
                aria-label="log in"
                icon={logInIcon}
                type="submit"
                variant="mobileNav"
                opacity={active === 4 ? 1 : 0.4}
                pt="12px"
              />
            </Form>
          )}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default MobileNavBar;
