import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
  useLoaderData,
} from '@remix-run/react';
import type { MetaFunction, LinksFunction, LoaderFunction } from '@remix-run/node';
import { Heading, ChakraProvider, Text } from '@chakra-ui/react';

import { theme } from '~/lib/theme';
import Layout from '~/components/Layout';
import type { UserProfile } from '~/services/auth.server';
import { authenticator } from '~/services/auth.server';
import { ScrollRestoration } from './hooks/useScrollRestoration';
import { withEmotionCache } from '@emotion/react';
import { useContext, useEffect } from 'react';
import { ClientStyleContext, ServerStyleContext } from './lib/emotion/context';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
});

export let links: LinksFunction = () => {
  return [
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

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.isAuthenticated(request);
};

const App = () => {
  const data = useLoaderData<UserProfile>();

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Layout user={data}>
          <Outlet />
        </Layout>
      </ChakraProvider>
    </Document>
  );
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
        <Layout user={null}>
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
        <Layout user={null}>
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
