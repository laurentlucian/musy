import type { LoaderArgs } from '@remix-run/server-runtime';

import { redirect } from 'remix-typedjson';

const Index = () => {
  // @todo landing page
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const isMobile = request.headers.get('user-agent')?.includes('Mobile') ?? false;
  return redirect(isMobile ? '/home' : '/home/friends');
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
