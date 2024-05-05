import './globals.css';
import './lib/fonts.css';
import './lib/icons/waver.css';

import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { AnimatePresence } from 'framer-motion';
import { redirect, typedjson } from 'remix-typedjson';

import Layout from '~/components/Layout';
import { authenticator } from '~/services/auth.server';
import { getAllUsers, getCurrentUser } from '~/services/prisma/users.server';

import { FullscreenRenderer, useFullscreenOpen } from './components/fullscreen/Fullscreen';
import useAnalytics from './hooks/useAnalytics';
import { PlayPreviewRenderer } from './hooks/usePlayPreview';
import { TooltipProvider } from './lib/ui/tooltip';
import { iosSplashScreens } from './lib/utils';

const App = () => {
  useAnalytics();

  return (
    <Document>
      <TooltipProvider>
        <AnimatePresence mode='wait' initial={false}>
          <Layout>
            <Outlet />
          </Layout>
        </AnimatePresence>
        <FullscreenRenderer />
        <PlayPreviewRenderer />
      </TooltipProvider>
    </Document>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);

  if (!session && url.pathname !== '/' && !url.pathname.includes('/api/auth/spotify/callback')) {
    return redirect('/');
  }

  const id = session?.user?.id;
  const isMobile = request.headers.get('user-agent')?.includes('Mobile') ?? false;

  const ENV = {
    PUBLIC_POSTHOG_KEY: process.env.PUBLIC_POSTHOG_KEY,
  };

  if (!session || !id)
    return typedjson({
      ENV,
      currentUser: null,
      isMobile,
      users: [],
    });

  const [currentUser, users] = await Promise.all([getCurrentUser(request), getAllUsers(id)]);

  return typedjson({
    ENV,
    currentUser,
    isMobile,
    users,
  });
};

export const links: LinksFunction = () => {
  return [
    {
      as: 'manifest',
      href: '/manifest.json',
      rel: 'manifest',
    },
    {
      href: '/apple-touch-icon.png',
      rel: 'apple-touch-icon',
    },
    ...iosSplashScreens,
  ];
};

type DocumentProps = {
  children: React.ReactNode;
  title?: string;
};

const Document = ({ children, title = 'musy' }: DocumentProps) => {
  const fullscreen = useFullscreenOpen();

  return (
    <html
      lang='en'
      style={{
        overflowY: fullscreen ? 'hidden' : undefined,
        touchAction: fullscreen ? 'none' : undefined,
      }}
    >
      <head>
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta charSet='utf-8' />
        <meta name='description' content='Music shared easy' />
        <meta name='keywords' content='music, discover, spotify, playlist, share, friends' />
        <meta property='og:description' content='Music shared easy' />
        <meta property='og:image' content='/meta-image.png' />
        <meta property='og:image:alt' content='musy' />
        <meta property='og:image:height' content='630' />
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:title' content='musy' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:description' content='Music shared easy' />
        <meta name='twitter:image' content='/meta-image.png' />
        <meta name='twitter:title' content='musy' />
        <meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no' />
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default App;
