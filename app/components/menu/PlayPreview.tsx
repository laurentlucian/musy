import { useRef, useEffect, useState } from 'react';
import { PauseCircle, PlayCircle } from 'iconsax-react';
import { Button } from '@chakra-ui/react';

const PlayPreview = ({ preview_url }: { preview_url: string | null }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onClick = () => {
    if (audioRef.current && !playing) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };
  const text = playing ? 'Pause' : 'Play';
  const icon = playing ? <PauseCircle /> : <PlayCircle />;
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.05;
  }, []);
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
        >
          {text} Preview
        </Button>
      )}
      {preview_url && <audio ref={audioRef} src={preview_url} />}
    </>
  );
};

export default PlayPreview;
