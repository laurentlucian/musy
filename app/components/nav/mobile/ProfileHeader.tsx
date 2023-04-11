import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, Divider, HStack, IconButton, Stack, Text, useColorModeValue } from '@chakra-ui/react';

import { ArrowLeft2 } from 'iconsax-react';

import useParamUser from '~/hooks/useParamUser';

import UserMenu from '../UserMenu';

const ProfileHeader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useParamUser();

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue(
    user?.theme?.backgroundLight ?? '#EEE6E2',
    user?.theme?.backgroundDark ?? '#050404',
  );

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY - 50);
    };
    window.addEventListener('scroll', checkScroll);

    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <Stack>
      <HStack opacity={1} mb="-8px">
        <HStack w="100vw" h="41px" bg={bg} opacity={show / 90} overflow="clip" textAlign="center">
          <Stack w="100vw" h="74px">
            {show <= 84 ? <Box h={show <= 84 ? `${104 - show}px` : '16px'} /> : <Box h="16px" />}
            <Text h="37px" alignSelf="center" opacity={show / 90} w="100vw">
              {user?.name}
            </Text>
          </Stack>
        </HStack>
        <IconButton
          aria-label="back"
          icon={<ArrowLeft2 />}
          variant="ghost"
          onClick={() => {
            searchParams.delete('spotify');
            setSearchParams(searchParams, {
              replace: true,
              state: { scroll: false },
            });
            if (!pathname.includes('spotify')) {
              navigate(-1);
            }
          }}
          size="xs"
          pos="fixed"
          top={2}
          left="-5px"
        />
        <UserMenu />
      </HStack>
      <Divider bgColor={color} opacity={show / 90} />
    </Stack>
  );
};

export default ProfileHeader;
