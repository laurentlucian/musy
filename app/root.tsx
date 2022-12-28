import { Links, LiveReload, Meta, Outlet, Scripts, useCatch } from '@remix-run/react';
import type { MetaFunction, LinksFunction, LoaderArgs } from '@remix-run/node';
import {
  Heading,
  ChakraProvider,
  Text,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react';

import { theme } from '~/lib/theme';
import Layout from '~/components/Layout';
import { authenticator } from '~/services/auth.server';
import { ScrollRestoration } from './hooks/useScrollRestoration';
import { withEmotionCache } from '@emotion/react';
import { useContext, useEffect } from 'react';
import { ClientStyleContext, ServerStyleContext } from './lib/emotion/context';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import loading from './lib/styles/loading.css';
import { prisma } from './services/db.server';

const App = () => {
  const { currentUser, cookie } = useTypedLoaderData<typeof loader>();
  const colorModeManager =
    typeof cookie === 'string' ? cookieStorageManagerSSR(cookie) : localStorageManager;

  return (
    <Document>
      <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
        <Layout authorized={!!currentUser}>
          <Outlet />
        </Layout>
      </ChakraProvider>
    </Document>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const cookie = request.headers.get('cookie') ?? '';
  const isMobile = request.headers.get('user-agent')?.includes('Mobile') ?? false;

  if (session && session.user) {
    const currentUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { settings: true },
    });

    return typedjson({ currentUser, cookie, isMobile });
  } else {
    return typedjson({ currentUser: null, cookie, isMobile });
  }
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
  description: "Let's discover music together, join musy :)",
  'apple-mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
  'user-scalable': 'no',
});

export let links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: loading },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstaticom' },
    {
      as: 'font',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap',
    },
    {
      as: 'font',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap',
    },
    {
      as: 'font',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;500;600;700;800;900&display=swap"',
    },
  ];
};

type DocumentProps = {
  children: React.ReactNode;
  title?: string;
};

const Document = withEmotionCache(({ children, title = 'Musy' }: DocumentProps, emotionCache) => {
  const serverStyleData = useContext(ServerStyleContext);
  const clientStyleData = useContext(ClientStyleContext);

  // Only executed on client
  useEffect(() => {
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
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {serverStyleData?.map(({ key, ids, css }) => (
          <style
            key={key}
            data-emotion={`${key} ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
        <title>{title}</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
});

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.error(error);
  return (
    <Document title="Musy - Error">
      <ChakraProvider theme={theme}>
        <Layout authorized={false}>
          <Heading fontSize={['sm', 'md']}>Oops, unhandled error</Heading>
          <Text fontSize="sm">Trace(for debug): {error.message}</Text>
        </Layout>
      </ChakraProvider>
    </Document>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Oops, you shouldn't be here (No access)</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn't be here (Page doesn't exist)</Text>;
      break;

    default:
      // throw new Error(caught.data || caught.statusText);
      message = <Text>Oops, this definitely shouldn't have happened</Text>;
  }

  return (
    <Document title="Musy - Error">
      <ChakraProvider theme={theme}>
        <Layout authorized={false}>
          <Heading fontSize={['sm', 'md']}>
            {caught.status}: {caught.statusText}
          </Heading>
          <Text fontSize="sm">{message}</Text>
        </Layout>
      </ChakraProvider>
    </Document>
  );
};

export default App;
