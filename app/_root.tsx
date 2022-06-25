import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from '@remix-run/react';
import type { MetaFunction, LinksFunction, LoaderFunction } from '@remix-run/node';
import { Heading, ChakraProvider, Text } from '@chakra-ui/react';
import { withEmotionCache } from '@emotion/react';
import type { Session } from 'remix-auth-spotify';

import { theme } from '~/lib/theme';
import Layout from '~/components/Layout';
import { ServerStyleContext, ClientStyleContext } from '~/lib/emotion/context';
import { spotifyStrategy } from '~/services/auth.server';
import { useContext, useEffect } from 'react';

export const loader: LoaderFunction = async ({ request }) => {
  return spotifyStrategy.getSession(request);
};

const App = () => {
  const data = useLoaderData<Session>();

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Layout user={data?.user}>
          <Outlet />
        </Layout>
      </ChakraProvider>
    </Document>
  );
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.error(error);
  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Layout user={null}>
          <Heading fontSize={['xl', 'xxl']}>Oops, unhandled error</Heading>
          <Text fontSize="md">Trace(for debug): {error.message}</Text>
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
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Layout user={null}>
          <Heading fontSize={['xl', 'xxl']}>
            {caught.status}: {caught.statusText}
          </Heading>
          <Text fontSize="md">{message}</Text>
        </Layout>
      </ChakraProvider>
    </Document>
  );
};

interface DocumentProps {
  children: React.ReactNode;
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Musy',
  viewport: 'width=device-width,initial-scale=1',
});

export let links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstaticom' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;500;600;700;800;900&display=swap"',
    },
  ];
};

const Document = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
  const serverSyleData = useContext(ServerStyleContext);
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
        {serverSyleData?.map(({ key, ids, css }) => (
          <style
            key={key}
            data-emotion={`${key} ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
});

export default App;
