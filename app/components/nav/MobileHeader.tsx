import { useLocation } from '@remix-run/react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import useCurrentUser from '~/hooks/useCurrentUser';

import ProfileActions from '../profile/profileHeader/profileActions/ProfileActions';
import SearchInput from '../search/SearchInput';
import HomeHeader from './mobile/HomeHeader';
import ProfileHeader from './mobile/ProfileHeader';
import SettingsHeader from './mobile/SettingsHeader';
import UserMenu from './UserMenu';

const MobileHeader = () => {
  const currentUser = useCurrentUser();
  const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', 'black');
  const border = useColorModeValue('musy.400', 'musy.700');

  const isHome = pathname === '/home';
  const isExplore = pathname === '/explore';
  const isSettings = pathname === '/settings';
  const isProfile = !isHome && !isExplore && !isSettings;
  const isOwnProfile = currentUser?.userId === pathname.split('/')[1];

  const Header = isHome ? (
    <HomeHeader />
  ) : isExplore ? (
    <SearchInput param="keyword" />
  ) : isSettings ? (
    <SettingsHeader />
  ) : (
    <ProfileHeader />
  );

  return (
    <Box h="45px">
      <Flex
        h="45px"
        as="header"
        backdropFilter="blur(27px)"
        bg={isProfile ? 'transparent' : bg}
        py="8px"
        borderBottom={isProfile ? undefined : '1px solid'}
        borderColor={border}
        zIndex={9}
        justify="center"
        align="center"
        pos="fixed"
        right={0}
        left={0}
        top={0}
        w="100%"
      >
        {Header}
        {isProfile ? isOwnProfile ? <UserMenu /> : <ProfileActions /> : null}
      </Flex>
    </Box>
  );
};

export default MobileHeader;
