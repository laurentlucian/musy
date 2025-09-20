import { use } from "react";
import type { getTopLeaderboard } from "~/lib/services/db/tracks.server";
import { Track } from "./track";

export function Leaderboard(props: {
  leaderboard: ReturnType<typeof getTopLeaderboard>;
}) {
  const leaderboard = use(props.leaderboard);

  return leaderboard.map((track, index) => {
    return (
      <li key={track.id} className="flex items-center gap-x-2">
        <span className="basis-6 font-bold">{index + 1}.</span>
        <Track id={track.id} track={track} />
      </li>
    );
  });
}
