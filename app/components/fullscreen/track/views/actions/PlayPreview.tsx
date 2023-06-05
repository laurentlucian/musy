import { useRef, useEffect, useState } from 'react';

import { PauseCircle, PlayCircle } from 'iconsax-react';

import AudioVisualizer from '~/lib/icons/AudioVisualizer';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';

import ActionButton from '../../../shared/FullscreenActionButton';
import { useFullscreenTrack } from '../../FullscreenTrack';

const PlayPreview = () => {
  const { track } = useFullscreenTrack();
  const [playing, setPlaying] = useState<boolean>();
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const onClick = () => {
    if (audioRef.current && !playing) {
      void audioRef.current.play();
      setPlaying(true);
      setShowPause(false);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
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
      {track.preview_url !== '' && track.preview_url && (
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
      {track.preview_url && <audio ref={audioRef} src={track.preview_url} />}
    </>
  );
};

export default PlayPreview;
