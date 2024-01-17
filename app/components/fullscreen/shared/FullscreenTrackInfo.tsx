import useIsMobile from "~/hooks/useIsMobile";
import type { TrackWithInfo } from "~/lib/types/types";

const TrackInfo = (props: { track: TrackWithInfo }) => {
  const isSmallScreen = useIsMobile();
  const { track } = props;

  return (
    <div className="stack md:stack-1 flex-1 items-center md:items-start">
      <a
        href={track.uri}
        className="w-fit break-all text-center font-bold hover:underline md:text-left"
      >
        {track.name}
      </a>
      <div className="flex items-center space-x-1 px-2 md:flex-col md:items-start md:space-x-0 md:px-0 ">
        <a
          href={track.artistUri}
          className="whitespace-nowrap text-[11px] text-musy-200 hover:underline md:text-[13px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {track.artist}
        </a>
        {isSmallScreen && <span className="opacity-60">•</span>}
        <a
          className="overflow-hidden overflow-ellipsis whitespace-nowrap text-[10px] text-musy-200 hover:underline md:text-[11px]"
          href={track.albumUri}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {track.albumName}
        </a>
      </div>
    </div>
  );
};

export default TrackInfo;
