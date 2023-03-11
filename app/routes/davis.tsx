import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node';

import { Heading, Stack, Button, Box, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import {
  authenticator,
  getAllUsers,
  getCurrentUser,
  // updateUserImage,
  // updateUserName,
} from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Davis = () => {
  const { friendsList, spotify, user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isPrivate = user?.settings?.isPrivate;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isDev = currentUser?.settings?.dev === true;
  const bg = useColorModeValue(user.theme?.backgroundLight, user.theme?.backgroundDark);
  const bgGradient = useColorModeValue(user.theme?.bgGradientLight, user.theme?.bgGradientDark);
  const gradient = user.theme?.gradient;

  return (
    <Stack>
      <Heading>
        Hi, I'm Davis my friends
        {friendsList.map((friend) => {
          return friend.friendId + ',';
        })}
      </Heading>
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;

  const user = await prisma.profile.findUnique({
    include: { ai: true, settings: true, theme: true },
    where: { userId: currentUser?.id },
  });

  //load a list of friends using prisma Friend model, where userId is currentUser.id and status is accepted
  const friendsList = await prisma.friends.findMany({
    where: {
      status: 'accepted',
      userId: currentUser?.id,
    },
  });

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

  return typedjson({
    friendsList,
    user,
  });
};

export default Davis;
