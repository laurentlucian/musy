import type { ReactNode } from "react";

import type { Track } from "~/lib/types/types";

import TileTrackInfo from "./TileTrackInfo";

type TileTrackListProps = {
  action?: ReactNode;
  image: ReactNode;
  onClick?: () => void;
  track: Track;
};

const TileTrackList = ({
  action,
  image,
  onClick,
  track,
}: TileTrackListProps) => {
  return (
    <div className="stack-h-2">
      {image}
      <div className="stack w-full justify-between" onClick={onClick}>
        <TileTrackInfo track={track} />
        <div className="flex">{action}</div>
      </div>
    </div>
  );
};

export default TileTrackList;
