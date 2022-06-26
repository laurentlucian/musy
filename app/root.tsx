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
import type { Session } from 'remix-auth-spotify';

import { theme } from '~/lib/theme';
import Layout from '~/components/Layout';
import { spotifyStrategy } from '~/services/auth.server';

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
    <Document title="Error">
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
    <html lang="en">
      <head>
        <Meta />
        <title>{`${caught.status} ${caught.statusText}`}</title>
        <Links />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <Layout user={null}>
            <Heading fontSize={['xl', 'xxl']}>
              {caught.status}: {caught.statusText}
            </Heading>
            <Text fontSize="md">{message}</Text>
          </Layout>
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

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

const Document = ({ children, title = 'Musy' }: { children: React.ReactNode; title?: string }) => {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default App;
