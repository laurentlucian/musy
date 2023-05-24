import { useRef, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { PauseCircle, PlayCircle } from 'iconsax-react';

import { useFullscreenActions } from '~/hooks/useFullscreenTileStore';
import AudioVisualizer from '~/lib/icons/AudioVisualizer';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';

import ActionButton from './shared/ActionButton';

const PlayPreview = ({
  playing,
  preview_url,
  setPlaying,
}: {
  playing: boolean;
  preview_url: string | null;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { setIsPlaying } = useFullscreenActions();

  const onClick = () => {
    if (audioRef.current && !playing) {
      void audioRef.current.play();
      setPlaying(true);
      setIsPlaying(true);
      setShowPause(false);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
      setIsPlaying(false);
    }
  };
  const text = playing ? 'Stop' : 'Listen';
  const icon =
    playing && !showPause ? (
      <AudioVisualizer />
    ) : playing && showPause && hovering ? (
      <PauseCircle />
    ) : playing ? (
      <AudioVisualizer />
    ) : (
      <PlayCircle />
    );

  const onMouseLeave = () => {
    setShowPause(true);
    setHovering(false);
  };
  const onMouseEnter = () => {
    setHovering(true);
  };
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.05;
  }, []);

  useEffect(() => {
    const ref = audioRef.current;
    if (ref) {
      ref.addEventListener('ended', () => setPlaying(false));
      return () => {
        ref.removeEventListener('ended', () => setPlaying(false));
      };
    }
  }, [audioRef]);

  return (
    <>
      {preview_url !== '' && preview_url && (
        <ActionButton
          onClick={onClick}
          leftIcon={icon}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
        >
          {text} preview &nbsp;
          <SpotifyLogo link={false} white icon />
        </ActionButton>
      )}
      {preview_url && <audio ref={audioRef} src={preview_url} />}
    </>
  );
};

export default PlayPreview;
