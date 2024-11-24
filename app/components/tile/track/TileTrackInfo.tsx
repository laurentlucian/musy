import { cn } from "~/lib/cn";
import SpotifyLogo from "~/lib/icons/SpotifyLogo";
import type { TrackWithInfo } from "~/lib/types/types";
import { timeSince } from "~/lib/utils";

const TileTrackInfo = ({
  className,
  createdAt,
  icon = true,
  track,
}: {
  className?: string;
  createdAt?: Date;
  icon?: boolean;
  track: TrackWithInfo;
}) => {
  return (
    <div className={cn("flex w-full justify-between", className)}>
      <div className="stack flex-grow">
        <a
          href={track.uri}
          className="line-clamp-1 w-44 overflow-hidden whitespace-normal break-all text-xs font-extralight hover:underline md:text-[13px]"
        >
          {track.name}
        </a>
        <div className="stack-h-1 items-baseline">
          <a
            href={track.artistUri}
            className="line-clamp-1 overflow-hidden break-all text-[9px] font-extralight opacity-60 hover:underline md:text-[10px]"
          >
            {track.artist}
          </a>
          <span className="-translate-y-px opacity-60">•</span>
          <a
            href={track.albumUri}
            className="line-clamp-1 overflow-hidden text-[9px] font-extralight opacity-60 hover:underline md:text-[10px]"
          >
            {track.albumName}
          </a>
        </div>
        {createdAt && (
          <p className="w-full text-[8px] opacity-50 md:text-[9px]">
            {timeSince(createdAt)}
          </p>
        )}
      </div>
      {icon && <SpotifyLogo icon w="21px" h="21px" />}
    </div>
  );
};

export default TileTrackInfo;
