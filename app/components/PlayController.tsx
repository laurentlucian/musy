import { HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { Next, Pause, Play, Previous } from 'iconsax-react';
import React from 'react';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import type { FetcherWithComponents } from '@remix-run/react';

type PlayControllerProps = {
  id: string;
  playback: CurrentlyPlayingObjectCustom;
  fetcher: FetcherWithComponents<any>;
};

const PlayController = ({ fetcher, playback, id }: PlayControllerProps) => {
  const loading = fetcher.submission?.formData.has('play') ?? false;
  return (
    <HStack w="100%" justify="start">
      <Tooltip label="Prev Song">
        <fetcher.Form action={`/${id}/prev`} method="post" replace>
          <IconButton
            aria-label="Prev"
            variant="ghost"
            icon={<Previous />}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            boxShadow="none"
            type="submit"
          />
        </fetcher.Form>
      </Tooltip>
      <Tooltip label={playback?.is_playing ? 'Pause' : 'Play'}>
        <fetcher.Form
          action={playback?.is_playing ? `/${id}/pause` : `/${id}/play`}
          method="post"
          replace
        >
          <IconButton
            name="play"
            aria-label={playback?.is_playing ? 'Pause' : 'Play'}
            variant="ghost"
            icon={playback?.is_playing ? <Pause /> : <Play />}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            boxShadow="none"
            type="submit"
            isLoading={loading}
          />
        </fetcher.Form>
      </Tooltip>
      <Tooltip label="Next Song">
        <fetcher.Form action={`/${id}/next`} method="post" replace>
          <IconButton
            aria-label="Next"
            variant="ghost"
            icon={<Next />}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            boxShadow="none"
            type="submit"
          />
        </fetcher.Form>
      </Tooltip>
    </HStack>
  );
};

export default PlayController;
