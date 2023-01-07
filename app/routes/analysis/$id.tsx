import { Button, Heading, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { Form, Link, useCatch, useTransition } from '@remix-run/react';
import type { HeadersFunction, LoaderArgs } from '@remix-run/server-runtime';
import type { TypedMetaFunction } from 'remix-typedjson';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { authenticator } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';
import { redis } from '~/services/scheduler/redis.server';
import { askDaVinci } from '~/services/ai.server';
import { useEffect } from 'react';
import { useDrawerActions } from '~/hooks/useDrawer';

const TrackAnalysis = () => {
  const { track, analysis, authorized } = useTypedLoaderData<typeof loader>();
  const transition = useTransition();
  const { onClose } = useDrawerActions();

  useEffect(() => {
    onClose();
  }, [onClose]);

  if (!track || !analysis) return null;

  return (
    <Stack>
      <HStack align="start">
        <Image src={track.album.images[0].url} width={200} height={200} borderRadius={5} />
        <Stack>
          <Heading>{track.name}</Heading>
          <Text>{track.artists[0].name}</Text>
          <Text>{track.album.name !== track.name ? track.album.name : ''}</Text>
          <Text>{track.popularity} Popularity</Text>
          {authorized && (
            <Form method="get" replace>
              <input type="hidden" name="refresh" value="1" />
              <Button type="submit" isLoading={transition.state !== 'idle'}>
                Refresh
              </Button>
            </Form>
          )}
        </Stack>
      </HStack>
      <Stack>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{analysis}</pre>
      </Stack>
    </Stack>
  );
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const cacheKey = 'track_analysis_' + id;
  const cachedData = await redis.get(cacheKey);
  const session = await authenticator.isAuthenticated(request);

  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get('refresh') && session ? true : false;

  if (cachedData && !shouldRefresh) {
    console.log('Cache hit');
    const data = { ...JSON.parse(cachedData), authorized: !!session } as {
      track: SpotifyApi.SingleTrackResponse;
      analysis: string;
      authorized: boolean;
    };
    return typedjson(data, { headers: { cached: 'true' } });
  }

  // if (!session) {
  //   return redirect('/auth/spotify?returnTo=/analysis');
  // }

  // const { user } = session;
  // if (!user)
  //   return typedjson(
  //     { track: null, analysis: null, authorized: !!session },
  //     { statusText: 'Failed to load session, try again', status: 401 },
  //   );

  const { spotify } = await spotifyApi('1295028670');
  if (!spotify)
    return typedjson(
      { track: null, analysis: null, authorized: !!session },
      { statusText: 'Failed to load spotify, try again', status: 401 },
    );

  const { body: track } = await spotify.getTrack(id);
  if (!track) {
    return typedjson(
      { track: null, analysis: null, authorized: !!session },
      { statusText: 'Track not found', status: 404 },
    );
  }

  const {
    name,
    artists: [{ name: artist }],
  } = track;

  const prompt = `Elaborate on songwriting, vocal, instrumental, production, bpm, genre, chords, and mixing detail for ${artist}'s ${name}`;
  const response = await askDaVinci(prompt);

  const data = { track, analysis: response, authorized: !!session };

  // set cache for 1 month
  redis.set(cacheKey, JSON.stringify(data), 'EX', 60 * 60 * 24 * 30);
  return typedjson(data);
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    cached: loaderHeaders.get('cached') ?? 'false',
  };
};

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  const { track, analysis } = data;
  if (!track || !analysis) {
    return {
      title: 'musy Analysis',
      description: `Song not found 🥁`,
    };
  }

  return {
    title: `${track.name} Analysis`,
    description: analysis,
    'og:image': track.album.images[0].url,
    'og:description': analysis,
    'twitter:card': analysis,
  };
};

export const CatchBoundary = () => {
  let caught = useCatch();
  switch (caught.status) {
    case 401:
      break;
    case 404:
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status} {caught.data}
      </Heading>
      <Button mt={4} as={Link} to="/analysis">
        earch new song
      </Button>
    </>
  );
};

export default TrackAnalysis;
