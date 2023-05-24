import type { FetcherWithComponents } from '@remix-run/react';

import { HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import { Next, Pause, Play, Previous } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';

import SaveToLiked from '../tiles/fullscreen/menu/actions/SaveToLiked';

type PlayControllerProps = {
  fetcher: FetcherWithComponents<any>;
  id: string;
  playback: SpotifyApi.CurrentlyPlayingResponse;
};

const PlayController = ({ fetcher, id, playback }: PlayControllerProps) => {
  const loading = fetcher.formData?.has('play') ?? false;
  const prevSong = fetcher.formData?.has('prev') ?? false;
  const nextSong = fetcher.formData?.has('next') ?? false;
  const trackId = playback.item?.id;
  const color = useColorModeValue('#161616', '#EEE6E2');

  return (
    <HStack>
      <Tooltip label="previous" placement="top">
        <fetcher.Form action={`/api/controls/prev`} method="post" replace>
          <input type="hidden" name="userId" value={id} />
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
          action={playback.is_playing ? `/api/controls/pause` : `/api/controls/play`}
          method="post"
          replace
        >
          <input type="hidden" name="userId" value={id} />
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
        <fetcher.Form action={`/api/controls/next`} method="post" replace>
          <input type="hidden" name="userId" value={id} />
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
