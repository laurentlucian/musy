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

import { Code1, Ghost, Logout, MusicPlay, PlayCricle, Scroll } from 'iconsax-react';
import invariant from 'tiny-invariant';

import QueueSettings from '~/components/settings/QueueSettings';
import useCurrentUser from '~/hooks/useCurrentUser';
import { authenticator } from '~/services/auth.server';
import { upsertSettingsField } from '~/services/prisma/theme.server';

const Account = () => {
  const bg = useColorModeValue('musy.100', 'musy.800');
  const cancelBg = useColorModeValue('white', 'musy.400');
  const color = useColorModeValue('musy.800', 'white');
  const currentUser = useCurrentUser();
  const submit = useSubmit();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!currentUser) return null;
  const spotifyGreen = '#1DB954';

  return (
    <>
      <Stack spacing={5} w="100%" h="100%">
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <Ghost size="24" color={currentUser.settings?.isPrivate ? spotifyGreen : '#555555'} />
            <FormLabel fontSize={['sm', 'md']} htmlFor="private-profile" mb="0" color={color}>
              private profile
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
        <QueueSettings allowQueue={currentUser.settings?.allowQueue ?? 'on'} submit={submit} />
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <Scroll size="24" color={currentUser.settings?.autoscroll ? spotifyGreen : '#555555'} />
            <FormLabel fontSize={['sm', 'md']} htmlFor="auto-scroll" mb="0" color={color}>
              auto scroll
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
              song preview
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
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <PlayCricle
              size="24"
              color={currentUser.settings?.miniPlayer ? spotifyGreen : '#555555'}
              variant="Bold"
            />
            <FormLabel fontSize={['sm', 'md']} htmlFor="miniplayer" mb="0" color={color}>
              home miniplayer
            </FormLabel>
          </HStack>
          <Switch
            colorScheme="music"
            id="miniplayer"
            defaultChecked={currentUser.settings?.miniPlayer ?? false}
            onChange={(e) => {
              submit(
                { miniplayer: `${e.target.checked}` },

                { method: 'post', replace: true },
              );
            }}
            size="lg"
          />
        </FormControl>
        {currentUser.settings?.founder && (
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <HStack>
              <Code1 size="24" color={currentUser.settings.dev ? spotifyGreen : '#555555'} />
              <FormLabel fontSize={['sm', 'md']} htmlFor="'dev-mode'" mb="0" color={color}>
                dev mode
              </FormLabel>
            </HStack>
            <Switch
              colorScheme="music"
              id="dev-mode"
              defaultChecked={currentUser.settings.dev ?? false}
              onChange={(e) => {
                submit(
                  { 'dev-mode': `${e.target.checked}` },

                  { method: 'post', replace: true },
                );
              }}
              size="lg"
            />
          </FormControl>
        )}
        <Button
          leftIcon={<Logout />}
          bgColor="red.600"
          color="white"
          _hover={{ bgColor: 'red.500' }}
          onClick={onOpen}
        >
          log out
        </Button>
      </Stack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" bg={bg} color={color}>
              log out
            </AlertDialogHeader>
            <AlertDialogBody bg={bg} color={color}>
              <Text pl="20px">are you sure you want to logout?</Text>
            </AlertDialogBody>
            <AlertDialogFooter bg={bg} color={color}>
              <Form action={'/logout'} method="post">
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  bg={bg}
                  color={color}
                  _hover={{ bg: cancelBg, color: 'musy.800' }}
                >
                  cancel
                </Button>
                <Button
                  bgColor="red"
                  color="white"
                  onClick={onClose}
                  ml={3}
                  type="submit"
                  _hover={{ bgColor: 'red.500' }}
                >
                  log out
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
  const [session, data] = await Promise.all([
    authenticator.isAuthenticated(request),
    request.formData(),
  ]);

  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const promises = [
    upsertSettingsField('autoscroll', data.get('autoscroll'), userId, true),
    upsertSettingsField('allowPreview', data.get('allowPreview'), userId, true),
    upsertSettingsField('allowRecommend', data.get('allow-recommend'), userId),
    upsertSettingsField('allowQueue', data.get('allow-queue'), userId),
    upsertSettingsField('miniPlayer', data.get('miniPlayer'), userId, true),
    upsertSettingsField('dev', data.get('dev-mode'), userId, true),
    upsertSettingsField('isPrivate', data.get('private-profile'), userId, true),
  ];

  await Promise.all(promises);
  return null;
};

export default Account;
