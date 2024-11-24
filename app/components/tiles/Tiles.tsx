import type { ReactNode } from "react";

import clsx from "clsx";

import { useMouseScroll } from "~/hooks/useMouseScroll";
import { cn } from "~/lib/cn";
import type { TrackWithInfo } from "~/lib/types/types";

import { useFullscreen } from "../fullscreen/Fullscreen";
import FullscreenTracks from "../fullscreen/tracks/FullscreenTracks";
import ScrollButtons from "./shared/ScrollButtons";

type TilesProps = {
  action?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  className?: string;
  scrollButtons?: boolean;
  title?: string;
  tracks?: TrackWithInfo[];
};

const Tiles = ({
  action = null,
  autoScroll,
  children,
  className,
  scrollButtons,
  title,
  tracks,
}: TilesProps) => {
  const { props, scrollRef } = useMouseScroll("reverse", autoScroll);
  const { onOpen } = useFullscreen();

  return (
    <div className={cn("stack-3", className)}>
      {(title || scrollButtons || action) && (
        <div className="flex items-center">
          {title && (
            <p
              className={clsx("font-semibold text-[11px]", {
                "cursor-pointer": tracks,
              })}
              onClick={() => {
                if (title && tracks) {
                  onOpen(<FullscreenTracks title={title} tracks={tracks} />);
                }
              }}
            >
              {title}
            </p>
          )}
          {action}
          {scrollButtons && <ScrollButtons scrollRef={scrollRef} />}
        </div>
      )}
      <div
        className="scrollbar flex items-start space-x-4 overflow-auto pb-2"
        ref={scrollRef}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default Tiles;
