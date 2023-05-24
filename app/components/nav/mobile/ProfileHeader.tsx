import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, HStack, IconButton, Stack, Text } from '@chakra-ui/react';

import { ArrowLeft2 } from 'iconsax-react';
import { useTypedRouteLoaderData } from 'remix-typedjson';

import { useThemeBg } from '~/hooks/useTheme';
import type { loader } from '~/routes/$id';

const ProfileHeader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const { profileBg } = useThemeBg();

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY - 50);
    };
    window.addEventListener('scroll', checkScroll);

    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  if (!data) return null;
  const { user } = data;

  /* <HStack
        h="41px"
        bg={profileBg}
        opacity={show / 90}
        border="1px solid #E74B2D"
        overflow="clip"
        textAlign="center"
      >
        <Stack w="100vw">
          {show <= 84 ? <Box h={show <= 84 ? `${104 - show}px` : '16px'} /> : <Box h="16px" />}
          <Text h="37px" alignSelf="center" opacity={show / 90} w="100vw">
            {user?.name}
          </Text>
        </Stack>
      </HStack> */

  return (
    <IconButton
      w="100%"
      aria-label="back"
      icon={<ArrowLeft2 />}
      variant="unstyled"
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
    />
  );
};

export default ProfileHeader;
