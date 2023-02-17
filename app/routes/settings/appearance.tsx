import type { ActionArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import invariant from 'tiny-invariant';

import PlayerButtonSettings from '~/components/settings/profile/PlayerButtonSettings';
import ProfileSettings from '~/components/settings/profile/ProfileSettings';
import ThemeToggle from '~/components/settings/ThemeToggle';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Appearance = () => {
  const currentUser = useSessionUser();

  if (!currentUser) return null;
  return (
    <Stack spacing={5} w={['unset', '400px']}>
      <ThemeToggle />
      <PlayerButtonSettings playerButtonRight={currentUser.settings?.playerButtonRight} />
      <ProfileSettings />
    </Stack>
  );
};
export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const data = await request.formData();
  const playerButtonPreference = data.get('player-button-side');
  if (playerButtonPreference) {
    const playerButtonRight = playerButtonPreference === 'true';
    await prisma.settings.upsert({
      create: { playerButtonRight, userId },
      update: { playerButtonRight },
      where: { userId },
    });
  }
  return null;
};

export default Appearance;
