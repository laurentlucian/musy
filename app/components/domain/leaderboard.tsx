import { use } from "react";
import type { getTopLeaderboard } from "~/services/prisma/tracks.server";
import { Track } from "./track";

export function Leaderboard(props: {
  leaderboard: ReturnType<typeof getTopLeaderboard>;
}) {
  const leaderboard = use(props.leaderboard);

  return leaderboard.map((track, index) => {
    return (
      <li key={track.id} className="flex items-center gap-x-2">
        <span className="basis-6 font-bold">{index + 1}.</span>
        <Track
          id={track.id}
          uri={track.uri}
          image={track.image}
          artist={track.artist}
          name={track.name}
        />
      </li>
    );
  });
}
