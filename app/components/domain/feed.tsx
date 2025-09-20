import { use } from "react";
import type { getFeed } from "~/lib/services/db/tracks.server";
import { Track } from "./track";

export function Feed(props: { feed: ReturnType<typeof getFeed> }) {
  const feed = use(props.feed).map((value) => {
    return (
      value.recommend?.track ?? value.playlist?.track ?? value.liked?.track
    );
  });

  return feed.map((track, index) => {
    if (!track) return null;

    return (
      <li key={track.id} className="flex items-center gap-x-2">
        <span className="basis-6 font-bold">{index + 1}.</span>
        <Track track={track} />
      </li>
    );
  });
}
