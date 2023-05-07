import { useRef, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { Button } from '@chakra-ui/react';

import { PauseCircle, PlayCircle } from 'iconsax-react';

import { useDrawerActions } from '~/hooks/useDrawer';

import AudioVisualizer from '../../../../../icons/AudioVisualizer';
import SpotifyLogo from '../../../../../icons/SpotifyLogo';

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
  const { setIsPlaying } = useDrawerActions();

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
  const text = playing ? 'Pause' : 'Play';
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
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setPlaying(false));
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioRef?.current?.removeEventListener('ended', () => setPlaying(false));
      };
    }
  }, [audioRef]);

  return (
    <>
      {preview_url !== '' && preview_url && (
        <Button
          onClick={onClick}
          leftIcon={icon}
          mr="0px"
          variant="ghost"
          justifyContent="left"
          w={['100vw', '100%']}
          color="music.200"
          _hover={{ color: 'white' }}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
        >
          {text} Preview from &nbsp;
          <SpotifyLogo link={false} white />
        </Button>
      )}
      {preview_url && <audio ref={audioRef} src={preview_url} />}
    </>
  );
};

export default PlayPreview;
