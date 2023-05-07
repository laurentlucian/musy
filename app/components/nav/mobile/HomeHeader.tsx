import { Form, useLocation, useTransition } from '@remix-run/react';

import { Divider, HStack, IconButton, Image, Stack, useColorModeValue } from '@chakra-ui/react';

import { LoginCurve } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';
import Waver from '~/lib/icons/Waver';

import UserMenu from '../UserMenu';

const HomeHeader = () => {
  const transition = useTransition();
  const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#161616', '#EEE6E2');
  const currentUser = useSessionUser();

  const authorized = !!currentUser;

  return (
    <Stack w="100%" h="100%" bg={bg} pt="6px" alignItems="center" zIndex={1}>
      <HStack>
        <Image src="/musylogo1.svg" boxSize="35px" mb="-8px" />
        {!authorized ? (
          <Form action={'/auth/spotify?returnTo=' + pathname} method="post">
            <IconButton
              aria-label="log in"
              icon={<LoginCurve />}
              type="submit"
              variant="ghost"
              spinner={<Waver />}
              isLoading={transition.submission?.action.includes('auth')}
              color={color}
              pos="fixed"
              top={2}
              right={0}
            />
          </Form>
        ) : (
          <UserMenu />
        )}
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );
};

export default HomeHeader;
