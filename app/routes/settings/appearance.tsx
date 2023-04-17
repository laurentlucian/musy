import type { ActionArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import ProfileSettings from '~/components/settings/profile/ProfileSettings';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator, upsertField } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

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

  const theme = await prisma.theme.findUnique({
    where: { userId },
  });

  return typedjson({
    theme,
  });
};
export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const data = await request.formData();

  const promises = [
    upsertField('playerButtonRight', data.get('playerButtonSide'), userId, true),
    upsertField('gradient', data.get('gradient'), userId, true),
    upsertField('opaque', data.get('opaque'), userId, true),
    upsertField('blur', data.get('blur'), userId, true),
    upsertField('backgroundDark', data.get('backgroundDark'), userId),
    upsertField('backgroundLight', data.get('backgroundLight'), userId),
    upsertField('bgGradientDark', data.get('bgGradientDark'), userId),
    upsertField('bgGradientLight', data.get('bgGradientLight'), userId),
    upsertField('playerColorDark', data.get('playerColorDark'), userId),
    upsertField('playerColorLight', data.get('playerColorLight'), userId),
    upsertField('mainTextDark', data.get('mainTextDark'), userId),
    upsertField('mainTextLight', data.get('mainTextLight'), userId),
    upsertField('subTextDark', data.get('subTextDark'), userId),
    upsertField('subTextLight', data.get('subTextLight'), userId),
  ];

  await Promise.all(promises);

  return null;
};

export default Appearance;
