import { Form, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/server-runtime';
import { useRef } from 'react';

import {
  useDisclosure,
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
  Switch,
} from '@chakra-ui/react';

import { Code1, Ghost, Logout, MusicPlay, PlayCricle, Scroll } from 'iconsax-react';
import invariant from 'tiny-invariant';

import QueueSettings from '~/components/settings/QueueSettings';
import useCurrentUser from '~/hooks/useCurrentUser';
import { authenticator } from '~/services/auth.server';
import { upsertSettingsField } from '~/services/prisma/theme.server';

const Account = () => {
  // const bg = useColorModeValue('musy.100', 'musy.800');
  // const cancelBg = useColorModeValue('white', 'musy.400');
  // const color = useColorModeValue('musy.800', 'white');
  const currentUser = useCurrentUser();
  const submit = useSubmit();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!currentUser) return null;
  const spotifyGreen = '#1DB954';

  return (
    <>
      <div className='w-full h-full space-y-6 ml-5'>
        <div className='flex items-center justify-between'>
          <div className='flex gap-5'>
            <Ghost size='24' color={currentUser.settings?.isPrivate ? spotifyGreen : '#555555'} />
            <label className='sm:text-sm lg:text-md mb-0' htmlFor='private-profile'>
              private profile
            </label>
          </div>
          <Switch
            id='private-profile'
            defaultChecked={currentUser.settings?.isPrivate ?? false}
            onChange={(e) => {
              submit(
                { 'private-profile': `${e.target.checked}` },

                { method: 'POST', replace: true },
              );
            }}
            size='lg'
          />
        </div>
        <QueueSettings allowQueue={currentUser.settings?.allowQueue ?? 'on'} submit={submit} />
        <div className='flex items-center justify-between'>
          <div className='flex gap-5'>
            <Scroll size='24' color={currentUser.settings?.autoscroll ? spotifyGreen : '#555555'} />
            <label className='sm:text-sm lg:text-md mb-0' htmlFor='auto-scroll'>
              auto scroll
            </label>
          </div>
          <Switch
            colorScheme='music'
            id='auto-scroll'
            defaultChecked={currentUser.settings?.autoscroll ?? true}
            onChange={(e) => {
              submit(
                { autoscroll: `${e.target.checked}` },

                { method: 'POST', replace: true },
              );
            }}
            size='lg'
          />
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex gap-5'>
            <MusicPlay
              size='24'
              color={currentUser.settings?.allowPreview ? spotifyGreen : '#555555'}
              variant='Bold'
            />
            <label className='sm:text-sm lg:text-md mb-0' htmlFor='song-preview'>
              song preview
            </label>
          </div>
          <Switch
            colorScheme='music'
            id='allow-preview'
            defaultChecked={currentUser.settings?.allowPreview ?? false}
            onChange={(e) => {
              submit(
                { allowPreview: `${e.target.checked}` },

                { method: 'POST', replace: true },
              );
            }}
            size='lg'
          />
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex gap-5'>
            <PlayCricle
              size='24'
              color={currentUser.settings?.miniPlayer ? spotifyGreen : '#555555'}
              variant='Bold'
            />
            <label className='sm:text-sm lg:text-md mb-0' htmlFor='home-miniplayer'>
              home miniplayer
            </label>
          </div>
          <Switch
            colorScheme='music'
            id='home-miniplayer'
            defaultChecked={currentUser.settings?.miniPlayer ?? false}
            onChange={(e) => {
              submit(
                { miniplayer: `${e.target.checked}` },

                { method: 'POST', replace: true },
              );
            }}
            size='lg'
          />
        </div>
        {currentUser.settings?.founder && (
          <div className='flex items-center justify-between'>
            <div className='flex gap-5'>
              <Code1 size='24' color={currentUser.settings.dev ? spotifyGreen : '#555555'} />
              <label className='sm:text-sm lg:text-md mb-0' htmlFor='dev-mode'>
                dev mode
              </label>
            </div>
            <Switch
              colorScheme='music'
              id='dev-mode'
              defaultChecked={currentUser.settings.dev ?? false}
              onChange={(e) => {
                submit(
                  { 'dev-mode': `${e.target.checked}` },

                  { method: 'POST', replace: true },
                );
              }}
              size='lg'
            />
          </div>
        )}
        <button
        className='flex flex-row gap-5 hover:text-red-500'
          onClick={onOpen}
        >
          <Logout />
          log out
        </button>
      </div>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            {/* <AlertDialogHeader fontSize='lg' fontWeight='bold' bg={bg} color={color}>
              log out
            </AlertDialogHeader> */}
            {/* <AlertDialogBody bg={bg} color={color}>
              <p className='pl-5'>are you sure you want to logout?</p>
            </AlertDialogBody> */}
            {/* <AlertDialogFooter bg={bg} color={color}> */}
              <Form action='/api/logout' method='post'>
                <button
                  ref={cancelRef}
                  onClick={onClose}
                  // bg={bg}
                  // color={color}
                  // _hover={{ bg: cancelBg, color: 'musy.800' }}
                >
                  cancel
                </button>
                <button
                  // bgColor='red'
                  // color='white'
                  // onClick={onClose}
                  // ml={3}
                  // type='submit'
                  // _hover={{ bgColor: 'red.500' }}
                >
                  log out
                </button>
              </Form>
            {/* </AlertDialogFooter> */}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Account;
