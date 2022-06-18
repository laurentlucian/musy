import type { LoaderFunction } from '@remix-run/node';
import { spotifyStrategy } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await spotifyStrategy.getSession(request);
  console.log('session', session);
  const token = session?.accessToken;
  return token;
};
