import { getPlaybacks } from "@lib/services/db/tracks.server";
import { Suspense, use } from "react";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import type { Route } from "./+types/listening";

export function loader(_: Route.LoaderArgs) {
  return {
    playbacks: getPlaybacks(),
  };
}

export default function Listening({
  loaderData: { playbacks },
}: Route.ComponentProps) {
  return (
    <ul className="flex w-full max-w-md flex-col gap-y-2">
      <Suspense fallback={<Waver />}>
        <ListeningTracks playbacks={playbacks} />
      </Suspense>
    </ul>
  );
}

function ListeningTracks(props: {
  playbacks: ReturnType<typeof loader>["playbacks"];
}) {
  const tracks = use(props.playbacks);

  return tracks.map(({ track }, index) => {
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
