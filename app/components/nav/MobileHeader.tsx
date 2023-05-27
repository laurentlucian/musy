import { useLocation, useNavigation } from '@remix-run/react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import SearchInput from '../explore/SearchInput';
import HomeHeader from './mobile/HomeHeader';
import ProfileHeader from './mobile/ProfileHeader';
import SettingsHeader from './mobile/SettingsHeader';
import UserMenu from './UserMenu';
import { useThemeBg } from '~/hooks/useTheme';

const MobileHeader = () => {
  const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', 'black');
  const border = useColorModeValue('musy.400', 'musy.700');

  const isHome = pathname === '/home';
  const isExplore = pathname === '/explore';
  const isSettings = pathname === '/settings';
  const isProfile = !isHome || !isExplore || !isSettings;

  const Header = isHome ? (
    <HomeHeader />
  ) : isExplore ? (
    <SearchInput />
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
        top="0"
        w="100%"
      >
        {Header}
        <UserMenu />
      </Flex>
    </Box>
  );
};

export default MobileHeader;
