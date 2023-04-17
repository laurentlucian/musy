import type { ActionArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import ProfileSettings from '~/components/settings/profile/ProfileSettings';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { redis } from '~/services/scheduler/redis.server';

const Appearance = () => {
  const currentUser = useSessionUser();

  if (!currentUser) return null;
  return (
    <Stack spacing={5} w="100%" h="100%" direction={['column', 'row']}>
      <ProfileSettings />
    </Stack>
  );
};

export const loader = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');
  const currentThemeVersion = await prisma.profile
    .findUnique({
      select: { theme: { select: { version: true } } },
      where: { userId },
    })
    .then((result) => result?.theme?.version ?? null);

  const cacheThemeKey = 'theme';
  const themeVersionKey = '0';
  const cachedTheme = await redis.get(cacheThemeKey);
  const cachedVersion = await redis.get(themeVersionKey);
  let theme: Theme | null;

  if (cachedTheme && Number(cachedVersion) === currentThemeVersion) {
    theme = JSON.parse(cachedTheme);
  } else {
    theme = await prisma.theme.findUnique({
      where: { userId },
    });

    await redis.set(themeVersionKey, JSON.stringify(currentThemeVersion));
    await redis.set(cacheThemeKey, JSON.stringify(theme));
  }

  return typedjson({
    theme,
  });
};
export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const upsertField = async (field: string, data: FormDataEntryValue | null, isToggle = false) => {
    if (!data) return;

    const value = isToggle ? data === 'true' : data;

    await prisma.theme.upsert({
      create: { [field]: value, userId },
      update: { [field]: value },
      where: { userId },
    });
  };

  const data = await request.formData();

  const promises = [
    upsertField('playerButtonRight', data.get('playerButtonSide'), true),
    upsertField('gradient', data.get('gradient'), true),
    upsertField('opaque', data.get('opaque'), true),
    upsertField('blur', data.get('blur'), true),
    upsertField('backgroundDark', data.get('backgroundDark')),
    upsertField('backgroundLight', data.get('backgroundLight')),
    upsertField('bgGradientDark', data.get('bgGradientDark')),
    upsertField('bgGradientLight', data.get('bgGradientLight')),
    upsertField('playerColorDark', data.get('playerColorDark')),
    upsertField('playerColorLight', data.get('playerColorLight')),
    upsertField('mainTextDark', data.get('mainTextDark')),
    upsertField('mainTextLight', data.get('mainTextLight')),
    upsertField('subTextDark', data.get('subTextDark')),
    upsertField('subTextLight', data.get('subTextLight')),
  ];

  await Promise.all(promises);

  return null;
};

export default Appearance;
