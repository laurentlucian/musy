import type { MetaFunction, LinksFunction, LoaderArgs } from '@remix-run/node';
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

export const loader = async ({ request }: LoaderArgs) => {
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

export const meta: MetaFunction = () => {
  const description = 'Music shared easy';

  return {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black',
    charset: 'utf-8',
    description,
    keywords: 'music, discover, spotify, playlist, share, friends',
    'og:description': description,
    'og:image': '/meta-image.png',
    'og:image:alt': 'musy',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:width': '1200',
    'og:title': 'musy',

    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': '/meta-image.png',
    'twitter:title': 'musy',
    viewport: 'width=device-width,initial-scale=1,user-scalable=no',
  };
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
