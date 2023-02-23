import { useLocation, useTransition, Form, useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import {
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  useColorModeValue,
  Stack,
  Box,
  Button,
  IconButton,
} from '@chakra-ui/react';

import type { User } from '@prisma/client';
import { ArrowLeft2, LoginCurve } from 'iconsax-react';

import useParamUser from '~/hooks/useParamUser';
import useParentData from '~/hooks/useParentData';
import useSessionUser from '~/hooks/useSessionUser';

import Waver from '../icons/Waver';
import UserMenu from './UserMenu';

type ParentData = {
  currentUserId: string;
  timestamp: number;
  users: User[];
};

const MobileHeader = ({ authorized }: { authorized: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(0);
  const { pathname } = useLocation();
  const transition = useTransition();
  const navigate = useNavigate();

  const currentUser = useSessionUser();
  const users = useParentData('/friends') as ParentData | undefined;
  const user = useParamUser();
  const friendCount = (users?.users?.length ?? 1) - 1;

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue(
    user?.theme?.backgroundLight ?? '#EEE6E2',
    user?.theme?.backgroundDark ?? '#050404',
  );

  const Home = (
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
          <UserMenu isSmallScreen={true} pathname={pathname} />
        )}
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );

  const Friends = (
    <Stack w="100%" h="100%" bg={bg} pt="5px">
      <HStack w="100%" justifyContent="center">
        <HStack>
          <Heading fontSize="sm" pt="9px" pl="25px">
            Friends
          </Heading>
          <Text fontSize="xs" fontWeight="300" pt="10px">
            ~ {friendCount}
          </Text>
        </HStack>
        <UserMenu isSmallScreen={true} pathname={pathname} />
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );
  const Sessions = (
    <Stack w="100%" h="100%" bg={bg} pt="5px">
      <HStack w="100%" justifyContent="center">
        <HStack>
          <Heading fontSize="sm" pt="9px">
            Sessions
          </Heading>
        </HStack>
        <UserMenu isSmallScreen={true} pathname={pathname} />
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );

  const Profile = (
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
        <UserMenu isSmallScreen={true} pathname={pathname} />
      </HStack>
      <Divider bgColor={color} opacity={show / 90} />
    </Stack>
  );

  const Search = <UserMenu isSmallScreen={true} pathname={pathname} />;

  const Settings = (
    <Stack w="100%" h="100%" bg={bg}>
      <HStack w="100%" bg={bg} justifyContent="center">
        <Heading fontSize="13px" mt="15px" ml="20px">
          Settings
        </Heading>
        <Button
          onClick={() => {
            navigate(-1);
          }}
          pos="fixed"
          top={2}
          right={0}
          bg={bg}
          color={color}
        >
          Done
        </Button>
      </HStack>
      <Divider bg={show + 50 <= 45 ? bg : color} />
    </Stack>
  );

  const Header = pathname.includes('home')
    ? Home
    : pathname.includes('friends')
    ? Friends
    : pathname.includes('sessions')
    ? Sessions
    : pathname.includes('explore')
    ? Search
    : pathname.includes('sessions')
    ? Home
    : pathname.includes('settings')
    ? Settings
    : Profile;

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY - 50);
    };
    window.addEventListener('scroll', checkScroll);

    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <Flex
      w="100%"
      as="header"
      justify={pathname.includes(`${currentUser?.userId}`) ? 'end' : 'space-between'}
      pos="fixed"
      top={0}
      zIndex={10}
    >
      {Header}
    </Flex>
  );
};

export default MobileHeader;
