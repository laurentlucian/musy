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
} from '@chakra-ui/react';
import RecommendSettings from '~/components/settings/RecommendSettings';
import QueueSettings from '~/components/settings/QueueSettings';
import type { ActionArgs } from '@remix-run/server-runtime';
import { authenticator } from '~/services/auth.server';
import useSessionUser from '~/hooks/useSessionUser';
import { Form, useSubmit } from '@remix-run/react';
import { prisma } from '~/services/db.server';
import { Logout } from 'iconsax-react';
import invariant from 'tiny-invariant';
import { useRef } from 'react';

const Account = () => {
  const bg = useColorModeValue('music.100', 'music.800');
  const cancelBg = useColorModeValue('white', 'music.400');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!currentUser) return null;

  return (
    <>
      <Stack spacing={5} w={['unset', '400px']}>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel fontSize={['sm', 'md']} htmlFor="private-profile" mb="0" color={color}>
            private profile
          </FormLabel>
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
          <FormLabel fontSize={['sm', 'md']} htmlFor="auto-scroll" mb="0" color={color}>
            auto scroll
          </FormLabel>
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
          <FormLabel fontSize={['sm', 'md']} htmlFor="allowPreview" mb="0" color={color}>
            song previews
          </FormLabel>
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
          logout
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
      where: { userId },
      create: { autoscroll: isChecked, userId },
      update: { autoscroll: isChecked },
    });
  }

  const allowPreview = data.get('allowPreview');
  if (allowPreview) {
    const isChecked = allowPreview === 'true';

    await prisma.settings.upsert({
      where: { userId },
      create: { allowPreview: isChecked, userId },
      update: { allowPreview: isChecked },
    });
  }

  const privateProfile = data.get('private-profile');
  if (privateProfile) {
    const isPrivate = privateProfile === 'true';

    await prisma.settings.upsert({
      where: { userId },
      create: { isPrivate, userId },
      update: { isPrivate },
    });
  }

  const queuePreference = data.get('allow-queue');
  if (typeof queuePreference === 'string') {
    await prisma.settings.update({
      where: { userId },
      data: { allowQueue: queuePreference },
    });
  }
  return null;
};

export default Account;
