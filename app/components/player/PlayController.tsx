import { HStack, IconButton } from '@chakra-ui/react';
import { Next, Pause, Play, Previous } from 'iconsax-react';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import type { FetcherWithComponents } from '@remix-run/react';
import Tooltip from '../Tooltip';
import SaveToLiked from '../menu/SaveToLiked';

type PlayControllerProps = {
  id: string;
  playback: CurrentlyPlayingObjectCustom;
  fetcher: FetcherWithComponents<any>;
};

const PlayController = ({ fetcher, playback, id }: PlayControllerProps) => {
  const loading = fetcher.submission?.formData.has('play') ?? false;
  const prevSong = fetcher.submission?.formData.has('prev') ?? false;
  const nextSong = fetcher.submission?.formData.has('next') ?? false;
  const track = playback.item?.id;
  console.log(track, id, 'test');
  return (
    <HStack w="100%" justify="start">
      <Tooltip label="Prev Song">
        <fetcher.Form action={`/${id}/prev`} method="post" replace>
          <IconButton
            name="prev"
            aria-label="Prev"
            variant="ghost"
            icon={<Previous />}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            boxShadow="none"
            type="submit"
            isLoading={prevSong}
          />
        </fetcher.Form>
      </Tooltip>
      <Tooltip label={playback.is_playing ? 'Pause' : 'Play'}>
        <fetcher.Form
          action={playback.is_playing ? `/${id}/pause` : `/${id}/play`}
          method="post"
          replace
        >
          <IconButton
            name="play"
            aria-label={playback.is_playing ? 'Pause' : 'Play'}
            variant="ghost"
            icon={playback.is_playing ? <Pause /> : <Play />}
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
            name="next"
            aria-label="Next"
            variant="ghost"
            icon={<Next />}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            boxShadow="none"
            type="submit"
            isLoading={nextSong}
          />
        </fetcher.Form>
      </Tooltip>
      {playback && track && <SaveToLiked trackId={track} />}
    </HStack>
  );
};

export default PlayController;
