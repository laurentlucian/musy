import type { FetcherWithComponents } from '@remix-run/react';

import { HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import { Next, Pause, Play, Previous } from 'iconsax-react';

import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';

import SaveToLiked from '../menu/actions/SaveToLiked';
import Tooltip from '../Tooltip';

type PlayControllerProps = {
  fetcher: FetcherWithComponents<any>;
  id: string;
  playback: CurrentlyPlayingObjectCustom;
};

const PlayController = ({ fetcher, id, playback }: PlayControllerProps) => {
  const loading = fetcher.submission?.formData.has('play') ?? false;
  const prevSong = fetcher.submission?.formData.has('prev') ?? false;
  const nextSong = fetcher.submission?.formData.has('next') ?? false;
  const trackId = playback.item?.id;
  const color = useColorModeValue('#161616', '#EEE6E2');

  return (
    <HStack>
      <Tooltip label="previous" placement="top">
        <fetcher.Form action={`/${id}/prev`} method="post" replace>
          <IconButton
            name="prev"
            aria-label="Prev"
            variant="ghost"
            icon={<Previous />}
            _hover={{ color: 'spotify.green', opacity: 1 }}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
            type="submit"
            isLoading={prevSong}
            color={color}
          />
        </fetcher.Form>
      </Tooltip>
      <Tooltip label={playback.is_playing ? 'pause' : 'play'} placement="top">
        <fetcher.Form
          action={playback.is_playing ? `/${id}/pause` : `/${id}/play`}
          method="post"
          replace
        >
          <IconButton
            name="play"
            aria-label={playback.is_playing ? 'pause' : 'play'}
            variant="ghost"
            icon={playback.is_playing ? <Pause /> : <Play />}
            _hover={{ color: 'spotify.green', opacity: 1 }}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
            type="submit"
            isLoading={loading}
            color={color}
          />
        </fetcher.Form>
      </Tooltip>
      <Tooltip label="next" placement="top">
        <fetcher.Form action={`/${id}/next`} method="post" replace>
          <IconButton
            name="next"
            aria-label="next"
            variant="ghost"
            icon={<Next />}
            _hover={{ color: 'spotify.green', opacity: 1 }}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
            type="submit"
            isLoading={nextSong}
            color={color}
          />
        </fetcher.Form>
      </Tooltip>
      {trackId && <SaveToLiked trackId={trackId} iconOnly />}
    </HStack>
  );
};

export default PlayController;
