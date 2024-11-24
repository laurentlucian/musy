import { useRef, useState } from "react";

import { PauseCircle, PlayCircle } from "iconsax-react";

import { usePlayPreview } from "~/hooks/usePlayPreview";
import AudioVisualizer from "~/lib/icons/AudioVisualizer";
import SpotifyLogo from "~/lib/icons/SpotifyLogo";

import ActionButton from "../../../shared/FullscreenActionButton";
import { useFullscreenTrack } from "../../FullscreenTrack";

const PlayPreview = () => {
  const { track } = useFullscreenTrack();
  const { isPlaying, onClick } = usePlayPreview(track.preview_url);
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const text = isPlaying ? "Stop" : "Listen";
  const icon =
    isPlaying && !showPause ? (
      <AudioVisualizer />
    ) : isPlaying && showPause && hovering ? (
      <PauseCircle />
    ) : isPlaying ? (
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

  return (
    <>
      {track.preview_url !== "" && track.preview_url && (
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
