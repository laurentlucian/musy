import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import useIsMobile from '~/hooks/useIsMobile';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import musyIcon from '~/lib/assets/musySquareIcon.png';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { Track as Tracks } from '~/lib/types/types';

const Track = (props: {
  addedAt: string;
  index: number;
  track: SpotifyApi.TrackObjectFull;
  tracks: Tracks[];
  userId: string;
}) => {
  const { onOpen } = useFullscreen();
  const isSmallScreen = useIsMobile();
  const layoutkey = props.addedAt.toString();

  const track = {
    albumName: props.track.album.name,
    albumUri: props.track.album.uri,
    artist: props.track.artists[0].name,
    artistUri: props.track.artists[0].uri,
    duration: props.track.duration_ms,
    explicit: props.track.explicit,
    id: props.track.id,
    image: props.track.album.images[0]?.url ?? musyIcon, // @todo: add default image if one does not exist
    link: props.track.external_urls.spotify,
    name: props.track.name,
    preview_url: props.track.preview_url,
    uri: props.track.uri,
  };

  const convert = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const SongTitle = <p className='truncate text-lg'>{track.name}</p>;
  const SongImage = (
    <img className='h-20 w-20 shrink-0 object-cover' src={track.image} alt='track' />
  );
  const ArtistName = (
    <div className='flex justify-between'>
      <div>
        <div className='flex items-center'>
          {track.explicit && <img className='mr-1 w-5' src={explicitImage} alt='explicit' />}
          <p className='truncate text-base opacity-80'>{track.artist}</p>
        </div>
        <SpotifyLogo />
      </div>
      {isSmallScreen && <SpotifyLogo icon />}
    </div>
  );
  const AlbumName = <p className='text-base opacity-80'>{track.albumName}</p>;
  const AddedAt = (
    <p className='w-full text-center text-base opacity-80'>
      {new Date(props.addedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </p>
  );

  const SongLength = (
    <p className='w-full text-center text-base opacity-80'>{convert(track.duration)}</p>
  );

  return (
    <tr
      className='z-10 cursor-pointer'
      onClick={() => onOpen(<FullscreenTrack track={track} originUserId={props.userId} />)}
    >
      <td>
        <div className='stack-h-2'>
          {SongImage}
          <div className='w-full'>
            {SongTitle}
            {ArtistName}
          </div>
        </div>
      </td>
      {!isSmallScreen && (
        <>
          <td>{AlbumName}</td>
          <td>{AddedAt}</td>
          <td>{SongLength}</td>
        </>
      )}
    </tr>
  );
};

export default Track;
