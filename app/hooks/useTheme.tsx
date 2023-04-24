import { useColorModeValue } from '@chakra-ui/system';

import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/$id';

export const useTheme = () => {
  const profileData = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const theme = profileData?.user.theme;
  const profileBg = useColorModeValue(
    theme?.backgroundLight ?? '#EEE6E2',
    theme?.backgroundDark ?? '#050404',
  );
  const bgGradient = useColorModeValue(theme?.bgGradientLight, theme?.bgGradientDark);
  const gradient = theme?.gradient ?? false;

  return { bgGradient, gradient, profileBg };
};
