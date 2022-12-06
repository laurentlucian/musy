import { Button, Heading, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { Link, useCatch } from '@remix-run/react';
import type { HeadersFunction, LoaderArgs } from '@remix-run/server-runtime';
import type { TypedMetaFunction } from 'remix-typedjson';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { authenticator } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';
import { redis } from '~/services/scheduler/redis.server';

const TrackAnalysis = () => {
  const { track, analysis } = useTypedLoaderData<typeof loader>();

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

  if (cachedData) {
    console.log('Cache hit');
    const data = JSON.parse(cachedData) as {
      track: SpotifyApi.SingleTrackResponse;
      analysis: string;
    };
    return typedjson(data, { headers: { cached: 'true' } });
  }

  const session = await authenticator.isAuthenticated(request);
  if (!session) {
    return redirect('/auth/spotify?returnTo=/analysis');
  }

  const { user } = session;
  if (!user)
    return typedjson(
      { track: null, analysis: null },
      { statusText: 'Failed to load session, try again', status: 401 },
    );

  const { spotify } = await spotifyApi(user.id);
  if (!spotify)
    return typedjson(
      { track: null, analysis: null },
      { statusText: 'Failed to load spotify, try again', status: 401 },
    );

  const { body: track } = await spotify.getTrack(id);
  if (!track) {
    return typedjson(
      { track: null, analysis: null },
      { statusText: 'Track not found', status: 404 },
    );
  }

  const {
    name,
    artists: [{ name: artist }],
  } = track;

  const prompt = `Elaborate on songwriting, vocal, instrumental, production, bpm, genre, chords, and mixing detail for ${artist}'s ${name}`;

  const res = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      model: 'text-davinci-003',
      max_tokens: 500,
      temperature: 0.5,
      // top_p: 1,
      // frequency_penalty: 0,
      // presence_penalty: 0,
      // stop: ['\
      // '],
    }),
  });

  const json = (await res.json()) as TextCompletion;

  const data = { track, analysis: json.choices?.[0].text };

  // set Cache for 1 day
  redis.set(cacheKey, JSON.stringify(data), 'EX', 60 * 60 * 24);
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
      title: 'Musy Analysis',
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

type TextCompletion = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
};

type Choice = {
  text: string;
  index: number;
  logprobs: any | null;
  finish_reason: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
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
        Search new song
      </Button>
    </>
  );
};

export default TrackAnalysis;
