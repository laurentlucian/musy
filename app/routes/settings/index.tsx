import { Form, useSubmit } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/server-runtime';
import { useRef } from 'react';

import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
  Switch,
  FormLabel,
  FormControl,
  useColorModeValue,
  Text,
  HStack,
} from '@chakra-ui/react';

import { Ghost, Logout, MusicPlay, Scroll } from 'iconsax-react';
import invariant from 'tiny-invariant';

import QueueSettings from '~/components/settings/QueueSettings';
import RecommendSettings from '~/components/settings/RecommendSettings';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Account = () => {
  const bg = useColorModeValue('music.100', 'music.800');
  const cancelBg = useColorModeValue('white', 'music.400');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const spotifyGreen = '#1DB954';
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!currentUser) return null;
  return (
    <>
      <Stack spacing={5} w={['unset', '400px']}>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <Ghost size="24" color={currentUser.settings?.isPrivate ? spotifyGreen : '#555555'} />
            <FormLabel fontSize={['sm', 'md']} htmlFor="private-profile" mb="0" color={color}>
              Private Profile
            </FormLabel>
          </HStack>
          <Switch
            colorScheme="music"
            id="private-profile"
            defaultChecked={currentUser.settings?.isPrivate ?? false}
            onChange={(e) => {
              submit(
                { 'private-profile': `${e.target.checked}` },

                { method: 'post', replace: true },
              );
            }}
            size="lg"
          />
        </FormControl>
        <QueueSettings allowQueue={currentUser.settings?.allowQueue ?? 'on'} />
        <RecommendSettings allowRecommend={currentUser.settings?.allowRecommend ?? 'on'} />
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <Scroll size="24" color={currentUser.settings?.autoscroll ? spotifyGreen : '#555555'} />
            <FormLabel fontSize={['sm', 'md']} htmlFor="auto-scroll" mb="0" color={color}>
              Auto Scroll
            </FormLabel>
          </HStack>
          <Switch
            colorScheme="music"
            id="auto-scroll"
            defaultChecked={currentUser.settings?.autoscroll ?? true}
            onChange={(e) => {
              submit(
                { autoscroll: `${e.target.checked}` },

                { method: 'post', replace: true },
              );
            }}
            size="lg"
          />
        </FormControl>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <MusicPlay
              size="24"
              color={currentUser.settings?.allowPreview ? spotifyGreen : '#555555'}
              variant="Bold"
            />
            <FormLabel fontSize={['sm', 'md']} htmlFor="allowPreview" mb="0" color={color}>
              Song Preview
            </FormLabel>
          </HStack>
          <Switch
            colorScheme="music"
            id="allowPreview"
            defaultChecked={currentUser.settings?.allowPreview ?? false}
            onChange={(e) => {
              submit(
                { allowPreview: `${e.target.checked}` },

                { method: 'post', replace: true },
              );
            }}
            size="lg"
          />
        </FormControl>
        <Button
          leftIcon={<Logout />}
          bgColor="red.600"
          color="white"
          _hover={{ bgColor: 'red.500' }}
          onClick={onOpen}
        >
          Logout
        </Button>
      </Stack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" bg={bg} color={color}>
              Log Out
            </AlertDialogHeader>
            <AlertDialogBody bg={bg} color={color}>
              <Text pl="20px">Are you sure you want to logout?</Text>
            </AlertDialogBody>
            <AlertDialogFooter bg={bg} color={color}>
              <Form action={'/logout'} method="post">
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  bg={bg}
                  color={color}
                  _hover={{ bg: cancelBg, color: 'music.800' }}
                >
                  Cancel
                </Button>
                <Button
                  bgColor="red"
                  color="white"
                  onClick={onClose}
                  ml={3}
                  type="submit"
                  _hover={{ bgColor: 'red.500' }}
                >
                  Log Out
                </Button>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const data = await request.formData();
  const autoscroll = data.get('autoscroll');
  if (autoscroll) {
    const isChecked = autoscroll === 'true';

    await prisma.settings.upsert({
      create: { autoscroll: isChecked, userId },
      update: { autoscroll: isChecked },
      where: { userId },
    });
  }

  const allowPreview = data.get('allowPreview');
  if (allowPreview) {
    const isChecked = allowPreview === 'true';

    await prisma.settings.upsert({
      create: { allowPreview: isChecked, userId },
      update: { allowPreview: isChecked },
      where: { userId },
    });
  }

  const privateProfile = data.get('private-profile');
  if (privateProfile) {
    const isPrivate = privateProfile === 'true';

    await prisma.settings.upsert({
      create: { isPrivate, userId },
      update: { isPrivate },
      where: { userId },
    });
  }

  const queuePreference = data.get('allow-queue');
  if (typeof queuePreference === 'string') {
    await prisma.settings.update({
      data: { allowQueue: queuePreference },
      where: { userId },
    });
  }
  const recommendPreference = data.get('allow-recommend');
  if (typeof recommendPreference === 'string') {
    await prisma.settings.update({
      data: { allowRecommend: recommendPreference },
      where: { userId },
    });
  }
  return null;
};

export default Account;
