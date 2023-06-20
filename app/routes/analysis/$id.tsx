import { Form, Link, useNavigation } from '@remix-run/react';
import type { HeadersFunction, LoaderArgs } from '@remix-run/server-runtime';
import { useEffect } from 'react';

import { Button, Heading, HStack, Image, Stack, Text } from '@chakra-ui/react';

import type { TypedMetaFunction } from 'remix-typedjson';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import { getAnalysis } from '~/services/ai.server';
import { authenticator } from '~/services/auth.server';
import { redis } from '~/services/scheduler/redis.server';
import { getSpotifyClient } from '~/services/spotify.server';

const TrackAnalysis = () => {
  const { analysis, authorized, track } = useTypedLoaderData<typeof loader>();
  const transition = useNavigation();
  const { onClose } = useFullscreen();

  useEffect(() => {
    onClose();
  }, [onClose]);

  if (!track || !analysis) return null;

  return (
    <Stack>
      <HStack align="start">
        <Image src={track.album.images[0].url} width={200} height={200} />
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

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const cacheKey = 'track_analysis_' + id;
  const [cachedData, session] = await Promise.all([
    redis.get(cacheKey),
    authenticator.isAuthenticated(request),
  ]);

  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get('refresh') && session ? true : false;

  if (cachedData && !shouldRefresh) {
    const data = { ...JSON.parse(cachedData), authorized: !!session } as {
      analysis: string;
      authorized: boolean;
      track: SpotifyApi.SingleTrackResponse;
    };
    return typedjson(data, { headers: { cached: 'true' } });
  }

  const { spotify } = await getSpotifyClient('1295028670');
  if (!spotify)
    return typedjson(
      { analysis: null, authorized: !!session, track: null },
      { status: 401, statusText: 'Failed to load spotify, try again' },
    );

  const { body: track } = await spotify.getTrack(id);
  if (!track) {
    return typedjson(
      { analysis: null, authorized: !!session, track: null },
      { status: 404, statusText: 'Track not found' },
    );
  }

  const response = await getAnalysis(track);

  const data = { analysis: response, authorized: !!session, track };

  // set cache for 6 months
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 60 * 60 * 24 * 30 * 6);
  return typedjson(data);
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    cached: loaderHeaders.get('cached') ?? 'false',
  };
};

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  const { analysis, track } = data;
  if (!track || !analysis) {
    return {
      description: `Song not found 🥁`,
      title: 'musy Analysis',
    };
  }

  return {
    description: analysis,
    'og:description': analysis,
    'og:image': track.album.images[0].url,
    title: `${track.name} Analysis`,
    'twitter:card': analysis,
  };
};

export default TrackAnalysis;
