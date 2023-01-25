import { PauseCircle, PlayCircle } from 'iconsax-react';
import AudioVisualizer from '../icons/AudioVisualizer';
import { useDrawerActions } from '~/hooks/useDrawer';
import { useRef, useEffect, useState } from 'react';
import SpotifyLogo from '../icons/SpotifyLogo';
import { Button } from '@chakra-ui/react';

const PlayPreview = ({ preview_url }: { preview_url: string | null }) => {
  const [playing, setPlaying] = useState(false);
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { setIsPlaying } = useDrawerActions();

  const onClick = () => {
    if (audioRef.current && !playing) {
      audioRef.current.play();
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
          w={['100vw', '550px']}
          color="music.200"
          _hover={{ color: 'white' }}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
        >
          {text} Preview from &nbsp;
          <SpotifyLogo link={false} />
        </Button>
      )}
      {preview_url && <audio ref={audioRef} src={preview_url} />}
    </>
  );
};

export default PlayPreview;
