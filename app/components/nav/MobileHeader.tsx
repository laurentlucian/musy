import { useLocation } from '@remix-run/react';

import { Flex, useColorModeValue } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import SearchInput from '../explore/SearchInput';
import FriendsHeader from './mobile/FriendsHeader';
import HomeHeader from './mobile/HomeHeader';
import ProfileHeader from './mobile/ProfileHeader';
import SessionsHeader from './mobile/SessionsHeader';
import SettingsHeader from './mobile/SettingsHeader';
import UserMenu from './UserMenu';

const MobileHeader = () => {
  const { pathname } = useLocation();
  const border = useColorModeValue('musy.400', 'musy.700');

  const Header = pathname.includes('home') ? (
    <HomeHeader />
  ) : pathname.includes('friends') ? (
    <FriendsHeader />
  ) : pathname.includes('sessions') ? (
    <SessionsHeader />
  ) : pathname.includes('explore') ? (
    <SearchInput />
  ) : pathname.includes('sessions') ? (
    <HomeHeader />
  ) : pathname.includes('settings') ? (
    <SettingsHeader />
  ) : (
    <ProfileHeader />
  );

  return (
    <Flex
      as="header"
      bg="black"
      py="8px"
      // justify={pathname.includes(`${currentUser?.userId}`) ? 'end' : 'space-between'}
      borderBottom="1px solid"
      borderColor={border}
      zIndex={9}
      justify="center"
      pos="relative"
    >
      {Header}
      <UserMenu />
    </Flex>
  );
};

export default MobileHeader;
