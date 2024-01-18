import { Form, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/server-runtime';

import { Code1, Ghost, Logout, MusicPlay, PlayCricle, Scroll } from 'iconsax-react';
import invariant from 'tiny-invariant';

import QueueSettings from '~/components/settings/QueueSettings';
import useCurrentUser from '~/hooks/useCurrentUser';
import { authenticator } from '~/services/auth.server';
import { upsertSettingsField } from '~/services/prisma/theme.server';

const Account = () => {
  const currentUser = useCurrentUser();
  const submit = useSubmit();
  if (!currentUser) return null;
  const spotifyGreen = '#1DB954';

  return (
    <div className='ml-5 h-full w-full space-y-6'>
      <div className='flex items-center justify-between'>
        <label
          className='lg:text-md mb-0 flex cursor-pointer gap-5 sm:text-sm'
          htmlFor='private-profile'
        >
          <Ghost size='24' color={currentUser.settings?.isPrivate ? spotifyGreen : '#555555'} />
          private profile
        </label>
        <Switch
          id='private-profile'
          defaultChecked={currentUser.settings?.isPrivate ?? false}
          onChange={(e) => {
            submit(
              { 'private-profile': `${e.target.checked}` },

              { method: 'POST', replace: true },
            );
          }}
        />
      </div>
      <QueueSettings allowQueue={currentUser.settings?.allowQueue ?? 'on'} submit={submit} />
      <div className='flex items-center justify-between'>
        <label
          className='lg:text-md mb-0 flex cursor-pointer gap-5 sm:text-sm'
          htmlFor='auto-scroll'
        >
          <Scroll size='24' color={currentUser.settings?.autoscroll ? spotifyGreen : '#555555'} />
          auto scroll
        </label>
        <Switch
          id='auto-scroll'
          defaultChecked={currentUser.settings?.autoscroll ?? true}
          onChange={(e) => {
            submit(
              { autoscroll: `${e.target.checked}` },

              { method: 'POST', replace: true },
            );
          }}
        />
      </div>
      <div className='flex items-center justify-between'>
        <label
          className='lg:text-md mb-0 flex cursor-pointer gap-5 sm:text-sm'
          htmlFor='song-preview'
        >
          <MusicPlay
            size='24'
            color={currentUser.settings?.allowPreview ? spotifyGreen : '#555555'}
            variant='Bold'
          />
          song preview
        </label>
        <Switch
          id='allow-preview'
          defaultChecked={currentUser.settings?.allowPreview ?? false}
          onChange={(e) => {
            submit(
              { allowPreview: `${e.target.checked}` },

              { method: 'POST', replace: true },
            );
          }}
        />
      </div>
      <div className='flex items-center justify-between'>
        <label
          className='lg:text-md mb-0 flex cursor-pointer gap-5 sm:text-sm'
          htmlFor='home-miniplayer'
        >
          <PlayCricle
            size='24'
            color={currentUser.settings?.miniPlayer ? spotifyGreen : '#555555'}
            variant='Bold'
          />
          home miniplayer
        </label>
        <Switch
          id='home-miniplayer'
          defaultChecked={currentUser.settings?.miniPlayer ?? false}
          onChange={(e) => {
            submit(
              { miniplayer: `${e.target.checked}` },

              { method: 'POST', replace: true },
            );
          }}
        />
      </div>
      {currentUser.settings?.founder && (
        <div className='flex items-center justify-between'>
          <label
            className='lg:text-md mb-0 flex cursor-pointer gap-5 sm:text-sm'
            htmlFor='dev-mode'
          >
            <Code1 size='24' color={currentUser.settings.dev ? spotifyGreen : '#555555'} />
            dev mode
          </label>
          <Switch
            id='dev-mode'
            defaultChecked={currentUser.settings.dev ?? false}
            onChange={(e) => {
              submit(
                { 'dev-mode': `${e.target.checked}` },

                { method: 'POST', replace: true },
              );
            }}
          />
        </div>
      )}
      <Form action='/api/logout' method='post'>
        <button className='flex flex-row gap-5 hover:text-red-500' type='submit'>
          <Logout />
          log out
        </button>
      </Form>
    </div>
  );
};

function Switch({
  defaultChecked,
  id,
  onChange,
}: {
  defaultChecked: boolean;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className='hidden'
      checked={defaultChecked}
      id={id}
      type='checkbox'
      onChange={onChange}
    />
  );
}

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
