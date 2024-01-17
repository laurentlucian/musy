import { useState } from "react";

import { Switch } from "@chakra-ui/react";

import { useRequiredCurrentUser } from "~/hooks/useCurrentUser";
import useFollowing from "~/hooks/useFollowing";
import type { TrackWithInfo } from "~/lib/types/types";

import TilePlayback from "../tile/playback/TilePlayback";
import Tiles from "./Tiles";

const TilesPlayback = () => {
  const users = useFollowing();
  const currentUser = useRequiredCurrentUser();
  const [tile, setTile] = useState(false);

  const active = users.filter((user) => user.playback);
  const inactive = users
    .filter((user) => !user.playback && user.playbacks.length)
    .sort((a, b) => {
      const aPlayback = a.playbacks[0]?.endedAt || 0;
      const bPlayback = b.playbacks[0]?.endedAt || 0;
      if (aPlayback > bPlayback) return -1;
      if (aPlayback < bPlayback) return 1;
      return 0;
    });

  const scrollButtons = [...active, ...inactive].length > 5;

  const tracks = active.map(
    ({ playback }) => playback?.track,
  ) as TrackWithInfo[];

  return (
    <div className="stack-3">
      <Tiles
        title="LISTENING"
        scrollButtons={scrollButtons}
        action={
          <Switch
            size="sm"
            ml="10px"
            colorScheme="whiteAlpha"
            onChange={() => setTile(!tile)}
          />
        }
        tracks={tracks}
      >
        <TilePlayback index={0} tile={tile} user={currentUser} />

        {active.map((user, index) => (
          <TilePlayback key={index} index={index} tile={tile} user={user} />
        ))}

        {inactive.map((user, index) => (
          <TilePlayback key={index} index={index} tile={tile} user={user} />
        ))}
      </Tiles>
    </div>
  );
};

export default TilesPlayback;
