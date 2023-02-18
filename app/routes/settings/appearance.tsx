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
    <Stack spacing={5} w={['unset', '400px']} h="100%">
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
  const gradientPreference = data.get('gradient');
  if (gradientPreference) {
    const gradient = gradientPreference === 'true';
    await prisma.theme.upsert({
      create: { gradient, userId },
      update: { gradient },
      where: { userId },
    });
  }
  const backgroundDark = data.get('backgroundDark');
  if (typeof backgroundDark === 'string') {
    await prisma.theme.upsert({
      create: { backgroundDark, userId },
      update: { backgroundDark },
      where: { userId },
    });
  }
  const backgroundLight = data.get('backgroundLight');
  if (typeof backgroundLight === 'string') {
    await prisma.theme.upsert({
      create: { backgroundLight, userId },
      update: { backgroundLight },
      where: { userId },
    });
  }
  const bgGradientDark = data.get('bgGradientDark');
  if (typeof bgGradientDark === 'string') {
    await prisma.theme.upsert({
      create: { bgGradientDark, userId },
      update: { bgGradientDark },
      where: { userId },
    });
  }
  const bgGradientLight = data.get('bgGradientLight');
  if (typeof bgGradientLight === 'string') {
    await prisma.theme.upsert({
      create: { bgGradientLight, userId },
      update: { bgGradientLight },
      where: { userId },
    });
  }
  const gradientColorDark = data.get('gradientColorDark');
  if (typeof gradientColorDark === 'string') {
    await prisma.theme.upsert({
      create: { gradientColorDark, userId },
      update: { gradientColorDark },
      where: { userId },
    });
  }
  const gradientColorLight = data.get('gradientColorLight');
  if (typeof gradientColorLight === 'string') {
    await prisma.theme.upsert({
      create: { gradientColorLight, userId },
      update: { gradientColorLight },
      where: { userId },
    });
  }

  return null;
};

export default Appearance;
