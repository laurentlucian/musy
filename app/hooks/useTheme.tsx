import { useColorModeValue } from '@chakra-ui/system';

import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/$id';

export const useThemeBg = () => {
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

export const useThemePlayer = () => {
  const profileData = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const theme = profileData?.user.theme;
  const opaque = theme?.opaque ? '' : '66';
  const bg = useColorModeValue(
    theme?.playerColorLight + opaque ?? 'musy.50',
    theme?.playerColorDark + opaque ?? '#10101066',
  );
  const main = useColorModeValue(
    theme?.mainTextLight ?? '#161616',
    theme?.mainTextDark ?? '#EEE6E2',
  );
  const sub = useColorModeValue(theme?.subTextLight ?? '#161616', theme?.subTextDark ?? '#EEE6E2');

  return { bg, blurPlayer: theme?.blur, main, sub };
};
