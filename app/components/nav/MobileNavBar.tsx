import { Link, useLocation, useNavigation } from '@remix-run/react';
import { Box, Flex, IconButton, Image, SimpleGrid, useColorModeValue } from '@chakra-ui/react';

import { Home2, SearchNormal1 } from 'iconsax-react';

import { useFullscreenTileStore } from '~/hooks/useFullscreenTileStore';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboard } from '~/hooks/useMobileKeyboardCheck';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '~/lib/icons/Waver';

const MobileNavBar = () => {
  const border = useColorModeValue('musy.400', 'musy.700');
  const color = useColorModeValue('musy.500', 'musy.200');
  const bg = useColorModeValue('#EEE6E2', 'black');
  const track = useFullscreenTileStore();
  const navigation = useNavigation();
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const { pathname } = useLocation();
  const { show } = useMobileKeyboard();

  if (!isSmallScreen) return null;

  const hideButton = track !== null || pathname === '/settings' || !show ? true : false;

  const isHomeLoading = navigation.location?.pathname === '/home';
  const isExploreLoading = navigation.location?.pathname === '/explore';
  const isProfileLoading = navigation.location?.pathname === `/${currentUser?.userId}`;

  const isHomeActive = pathname === '/home';
  const isExploreActive = pathname === '/explore';
  const isProfileActive = pathname === `/${currentUser?.userId}`;

  const profileIcon = <Image src={currentUser?.image} borderRadius="full" boxSize="30px" />;

  return !hideButton ? (
    <Box h="90px">
      <SimpleGrid
        as="header"
        pt="12px"
        pb="55px"
        position="fixed"
        right={0}
        left={0}
        bottom={0}
        bg={bg}
        color={color}
        borderTop="0.5px solid"
        borderColor={border}
        columns={3}
        transition="bottom 0.25s ease-out"
        zIndex={11}
      >
        <Flex justify="center">
          <IconButton
            display={isHomeLoading ? 'none' : 'flex'}
            as={Link}
            to="/home"
            w="50px"
            prefetch="render"
            aria-label="home"
            icon={<Home2 variant={isHomeActive ? 'Bold' : 'Outline'} />}
            variant="mobileNav"
            color={color}
            opacity={isHomeActive ? 1 : 0.4}
          />
          {isHomeLoading && <Waver mt="8px" />}
        </Flex>

        <Flex justify="center">
          <IconButton
            as={Link}
            display={isExploreLoading ? 'none' : 'flex'}
            to="/explore"
            prefetch="render"
            aria-label="search"
            w="50px"
            icon={<SearchNormal1 variant={isExploreActive ? 'Bold' : 'Outline'} />}
            variant="mobileNav"
            color={color}
            opacity={isExploreActive ? 1 : 0.4}
          />
          {isExploreLoading && <Waver mt="8px" />}
        </Flex>

        <Flex justify="center">
          <IconButton
            as={Link}
            display={isProfileLoading ? 'none' : 'flex'}
            to={`/${currentUser?.userId}`}
            prefetch="render"
            aria-label="profile"
            icon={profileIcon}
            variant="mobileNav"
            opacity={isProfileActive ? 1 : 0.4}
          />
          {isProfileLoading && <Waver mt="8px" />}
        </Flex>
      </SimpleGrid>
    </Box>
  ) : null;
};

export default MobileNavBar;
