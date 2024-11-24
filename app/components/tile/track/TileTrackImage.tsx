import clsx from "clsx";

import { useFullscreen } from "~/components/fullscreen/Fullscreen";
import FullscreenTrack from "~/components/fullscreen/track/FullscreenTrack";
import { cn } from "~/lib/cn";
import type { TrackWithInfo } from "~/lib/types/types";

type TileTrackImageProps = {
  box?: string;
  fullscreen?: {
    originUserId?: string;
    track: TrackWithInfo;
  };
  image: {
    className?: string;
    src: string;
  };
};

const TileTrackImage = ({ box, fullscreen, image }: TileTrackImageProps) => {
  const { onMouseDown, onMouseMove, onOpen } = useFullscreen();

  return (
    <div className={cn("shrink-0", box)}>
      <img
        alt="album-cover"
        draggable={false}
        className={clsx(
          "w-full rounded-[1px] border-transparent object-cover",
          {
            "cursor-default": !fullscreen,
            "cursor-pointer border hover:border-musy": fullscreen,
          },
          image?.className,
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onClick={() =>
          fullscreen &&
          onOpen(
            <FullscreenTrack
              track={fullscreen.track}
              originUserId={fullscreen.originUserId}
            />,
          )
        }
        src={image?.src}
      />
    </div>
  );
};

export default TileTrackImage;
