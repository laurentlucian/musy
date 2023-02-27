import { useLocation } from '@remix-run/react';

import { Flex } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import FriendsHeader from './mobile/FriendsHeader';
import HomeHeader from './mobile/HomeHeader';
import ProfileHeader from './mobile/ProfileHeader';
import SessionsHeader from './mobile/SessionsHeader';
import SettingsHeader from './mobile/SettingsHeader';
import UserMenu from './UserMenu';

const MobileHeader = () => {
  const { pathname } = useLocation();
  const currentUser = useSessionUser();
  
  const Header = pathname.includes('home') ? (
    <HomeHeader />
  ) : pathname.includes('friends') ? (
    <FriendsHeader />
  ) : pathname.includes('sessions') ? (
    <SessionsHeader />
  ) : pathname.includes('explore') ? (
    <UserMenu />
  ) : pathname.includes('sessions') ? (
    <HomeHeader />
  ) : pathname.includes('settings') ? (
    <SettingsHeader />
  ) : (
    <ProfileHeader />
  );

  return (
    <Flex
      w="100%"
      as="header"
      justify={pathname.includes(`${currentUser?.userId}`) ? 'end' : 'space-between'}
      pos="fixed"
      top={0}
      zIndex={9}
    >
      {Header}
    </Flex>
  );
};

export default MobileHeader;
