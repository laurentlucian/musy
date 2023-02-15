import { useLocation, useNavigate, useSubmit } from '@remix-run/react';
import { useEffect, useState } from 'react';
// import { Search, Users } from 'react-feather';

import { Box, IconButton, Image, useColorModeValue } from '@chakra-ui/react';

import { Home2, MusicPlaylist, Profile2User, SearchNormal1 } from 'iconsax-react';

import { useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboard } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';

const MobileNavBar = () => {
  const [active, setActive] = useState<number>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const submit = useSubmit();
  const track = useDrawerTrack();
  const { show } = useMobileKeyboard();
  const { pathname } = useLocation();
  const hideButton = track !== null || pathname.includes('/settings') || !show ? true : false;
  const bg = useColorModeValue('music.200', 'music.500');
  const color = useColorModeValue('music.500', 'music.200');
  const currentUser = useSessionUser();
  const profileIcon = (
    <Image
      src={currentUser ? currentUser?.image : '/favicon-32x32.png'}
      borderRadius="full"
      boxSize="30px"
    />
  );

  const onClickHome = () => {
    navigate(`/home`);
    setActive(0);
  };
  const onClickFriends = () => {
    navigate(`/friends`);
    setActive(1);
  };
  const onClickSessions = () => {
    navigate(`/sessions`);
    setActive(2);
  };
  const onClickExplore = () => {
    navigate(`/explore`);
    setActive(3);
  };
  const onClickUser = () => {
    currentUser
      ? navigate(`/${currentUser.id}`)
      : submit(null, {
          action: '/auth/spotify?returnTo=' + pathname,
          method: 'post',
          replace: true,
        });
    setActive(4);
  };

  useEffect(() => {
    if (pathname.includes('home')) {
      setActive(0);
    } else if (pathname.includes('friends')) {
      setActive(1);
    } else if (pathname.includes('sessions')) {
      setActive(2);
    } else if (pathname.includes('explore')) {
      setActive(3);
    } else if (pathname.includes(`${currentUser?.id}`)) {
      setActive(4);
    }
  }, [pathname, currentUser?.id]);

  return (
    <>
      {isMobile && (
        <Box
          pos="fixed"
          bg={bg}
          w="100vw"
          h="90px"
          borderRadius="20px"
          color={color}
          aria-label="search song"
          bottom={hideButton ? '-100px' : '0%'}
          display="flex"
          justifyContent="space-around"
          transition="bottom 0.25s ease-out"
          overflow="hidden"
        >
          <Box display="flex" justifyContent="space-around" w="100%" mt="10px" color={color}>
            <IconButton
              aria-label="home"
              icon={<Home2 variant={active === 0 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 0 ? 1 : 0.4}
              onClick={onClickHome}
            />
            <IconButton
              aria-label="friends"
              icon={<Profile2User variant={active === 1 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 1 ? 1 : 0.4}
              onClick={onClickFriends}
            />
            <IconButton
              aria-label="sessions"
              icon={<MusicPlaylist variant={active === 2 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              color={color}
              opacity={active === 2 ? 1 : 0.4}
              onClick={onClickSessions}
            />
            <IconButton
              aria-label="search"
              icon={<SearchNormal1 variant={active === 3 ? 'Bold' : 'Outline'} />}
              variant="mobileNav"
              bg={bg}
              opacity={active === 3 ? 1 : 0.4}
              color={color}
              onClick={onClickExplore}
            />
            <IconButton
              aria-label="profile"
              icon={profileIcon}
              variant="mobileNav"
              opacity={active === 4 ? 1 : 0.4}
              onClick={onClickUser}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default MobileNavBar;
