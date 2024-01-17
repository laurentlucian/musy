import { Form, useNavigation } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { redirect } from 'remix-typedjson';

import { cn } from '~/lib/cn';
import Waver from '~/lib/icons/Waver';
import { authenticator } from '~/services/auth.server';

const Index = () => {
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  return (
    <div className='stack items-center'>
      <div className='stack mt-28 items-center space-y-7'>
        <img
          alt='musy-logo'
          className='-mb-16 -ml-3 w-80 select-none'
          draggable={false}
          src='/musylogo1.svg'
        />
        <h1 className='text-6xl font-semibold'>musy</h1>
        <Form action='/api/auth/spotify' method='post'>
          <button
            className={cn(
              'rounded border border-musy-200 px-4 py-2 font-semibold text-musy-200 hover:bg-musy-200 hover:text-musy-900',
              {
                'bg-musy-200': submitting,
              },
            )}
            disabled={submitting}
            type='submit'
          >
            {submitting ? <Waver dark /> : 'Enter with Spotify'}
          </button>
        </Form>
      </div>
    </div>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  if (session && url.pathname === '/') return redirect('/home');
  return null;
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Index;
