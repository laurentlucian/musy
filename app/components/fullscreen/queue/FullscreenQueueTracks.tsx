import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

import { useTypedFetcher } from "remix-typedjson";

import TileTrackImage from "~/components/tile/track/TileTrackImage";
import TileTrackList from "~/components/tile/track/TileTrackList";
import type { loader } from "~/routes/api+/search+/results";

import SendButton from "../shared/actions/SendTrack";

const FullscreenQueueTracks = ({ userId }: { userId: string }) => {
  const [searchParams] = useSearchParams();
  const { data, load } = useTypedFetcher<typeof loader | undefined>();
  const search = searchParams.get("fullscreen");
  useEffect(() => {
    if (search) {
      load(`/api/search/results?fullscreen=${search}&param=fullscreen`);
    }
  }, [search, load]);

  const tracks = search ? (data?.tracks ?? []) : [];

  return (
    <div className="stack-3 pr-3">
      {tracks.map((track) => {
        return (
          <TileTrackList
            key={track.id}
            track={track}
            image={
              <TileTrackImage
                fullscreen={{
                  track: track,
                }}
                box="w-[75px] md:w-[90px]"
                image={{
                  src: track.image,
                }}
              />
            }
            action={<SendButton trackId={track.id} userId={userId} />}
          />
        );
      })}
    </div>
  );
};

export default FullscreenQueueTracks;
