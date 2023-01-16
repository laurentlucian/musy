import { redirect } from 'remix-typedjson';
import type { LoaderArgs } from '@remix-run/node';

const Index = () => {
  // const transition = useTransition();
  // const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);

  // @todo landing page
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  // const session = await authenticator.isAuthenticated(request);
  // const currentUser = session?.user ?? null;

  return redirect('/home/friends');
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
