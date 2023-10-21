import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import type { ShouldRevalidateFunction } from '@remix-run/react';
import {
  isRouteErrorResponse,
  useRouteError,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { useContext, useEffect } from 'react';

import {
  Heading,
  ChakraProvider,
  Text,
  cookieStorageManagerSSR,
  ColorModeProvider,
} from '@chakra-ui/react';

import { withEmotionCache } from '@emotion/react';
import { AnimatePresence } from 'framer-motion';
import { Forbidden } from 'iconsax-react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';

import Layout from '~/components/Layout';
import { theme } from '~/lib/theme';
import { authenticator } from '~/services/auth.server';
import { getAllUsers, getCurrentUser } from '~/services/prisma/users.server';

import NotFound from './components/error/NotFound';
import { FullscreenRenderer, useFullscreen } from './components/fullscreen/Fullscreen';
import useAnalytics from './hooks/useAnalytics';
import { PlayPreviewRenderer } from './hooks/usePlayPreview';
import { ClientStyleContext, ServerStyleContext } from './lib/emotion/context';
import fonts from './lib/fonts.css';
import waver from './lib/icons/waver.css';
import { iosSplashScreens } from './lib/utils';

const App = () => {
  const { cookie } = useTypedLoaderData<typeof loader>();
  useAnalytics();

  return (
    <Document cookie={cookie}>
      <Outlet />
      <FullscreenRenderer />
      <PlayPreviewRenderer />
    </Document>
  );
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
  defaultShouldRevalidate,
  nextUrl,
}) => {
  // if (nextUrl.search || nextUrl.pathname !== '/home' ) return false;

  return defaultShouldRevalidate;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  if (!session && url.pathname !== '/' && !url.pathname.includes('/api/auth/spotify/callback'))
    return redirect('/');

  const id = session?.user?.id;
  const cookie = request.headers.get('cookie') ?? '';
  const isMobile = request.headers.get('user-agent')?.includes('Mobile') ?? false;

  const ENV = {
    PUBLIC_POSTHOG_KEY: process.env.PUBLIC_POSTHOG_KEY,
  };

  if (!session || !id)
    return typedjson({
      ENV,
      cookie: '',
      currentUser: null,
      isMobile,
      users: [],
    });

  const [currentUser, users] = await Promise.all([getCurrentUser(request), getAllUsers(id)]);

  return typedjson({
    ENV,
    cookie,
    currentUser,
    isMobile,
    users,
  });
};

export let links: LinksFunction = () => {
  return [
    { as: 'style', href: waver, rel: 'stylesheet' },
    { as: 'style', href: fonts, rel: 'stylesheet' },
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
  cookie?: string;
  title?: string;
};

const Document = withEmotionCache(
  ({ children, cookie = '', title = 'musy' }: DocumentProps, emotionCache) => {
    const { components } = useFullscreen();
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);
    const colorModeManager = cookieStorageManagerSSR(cookie);

    // Only executed on client
    useEffect(
      () => {
        // re-link sheet container
        emotionCache.sheet.container = document.head;
        // re-inject tags
        const tags = emotionCache.sheet.tags;
        emotionCache.sheet.flush();
        tags.forEach((tag) => {
          (emotionCache.sheet as any)._insertTag(tag);
        });
        // reset cache to reapply global styles
        clientStyleData?.reset();
      }, // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        /* "clientStyleData", "emotionCache.sheet", */
      ],
    );

    return (
      <html
        lang="en"
        style={{
          overflowY: components.length > 0 ? 'hidden' : undefined,
          touchAction: components.length > 0 ? 'none' : undefined,
        }}
      >
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta charSet="utf-8" />
          <meta name="description" content="Music shared easy" />
          <meta name="keywords" content="music, discover, spotify, playlist, share, friends" />
          <meta property="og:description" content="Music shared easy" />
          <meta property="og:image" content="/meta-image.png" />
          <meta property="og:image:alt" content="musy" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:title" content="musy" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:description" content="Music shared easy" />
          <meta name="twitter:image" content="/meta-image.png" />
          <meta name="twitter:title" content="musy" />
          <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
          <Meta />
          <Links />
          {serverStyleData?.map(({ css, ids, key }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
          <title>{title}</title>
        </head>
        <body>
          <ChakraProvider theme={theme}>
            <ColorModeProvider
              colorModeManager={colorModeManager}
              options={{
                disableTransitionOnChange: true,
                initialColorMode: theme.config.initialColorMode,
                useSystemColorMode: theme.config.useSystemColorMode,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <Layout>{children}</Layout>
              </AnimatePresence>
            </ColorModeProvider>
          </ChakraProvider>
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
        </body>
      </html>
    );
  },
);

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404)
      return (
        <Document>
          <NotFound />
        </Document>
      );

    if (error.status === 403)
      return (
        <Document>
          <Forbidden />
        </Document>
      );
  } else if (error instanceof Error) {
    return (
      <Document title="musy - Error">
        <Heading fontSize={['sm', 'md']}>oops, unhandled error</Heading>
        <Text fontSize="sm">{error.message}</Text>
        <Text fontSize="sm">{error.stack}</Text>
      </Document>
    );
  }

  return (
    <Document title="musy - Error">
      <Heading fontSize={['sm', 'md']}>ooooops, unknown error</Heading>
      <Text fontSize="sm">reload the page eventually</Text>
    </Document>
  );
};

export default App;
