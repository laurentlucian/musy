import SpotifyLogo from "~/lib/icons/SpotifyLogo";
import type { TrackWithInfo } from "~/lib/types/types";
import { timeSince } from "~/lib/utils";

import TilePlaybackTracksImage from "../tile/playback/inactive/TilePlaybackTracksImage";
import Tiles from "../tiles/Tiles";
import ActivityInfo from "./shared/ActivityInfo";

const ActivityPlayback = ({ activity }: { activity: any }) => {
  if (!activity.user || !activity.tracks?.length) return null;
  const isMoreThan4Tracks = activity.tracks.length >= 4;

  const tracks = [] as TrackWithInfo[][];
  if (isMoreThan4Tracks) {
    for (let i = 0; i < activity.tracks.length; i += 4) {
      tracks.push(activity.tracks.slice(i, i + 4));
    }
  }

  return (
    <div className="stack items-center">
      <ActivityInfo activity={activity} />
      <div className="flex w-full pb-1">
        <div className="stack-3 w-full">
          {isMoreThan4Tracks ? (
            <Tiles className="max-w-[640px]">
              {tracks.map((t, index) => (
                <TilePlaybackTracksImage
                  key={index}
                  tracks={t}
                  fullscreen={{ originUserId: activity.user.userId }}
                  // className="shrink-0 max-w-[640px]"
                  imageTw="max-w-[190px] md:max-w-[225px] lg:max-w-[320px]"
                />
              ))}
            </Tiles>
          ) : (
            <TilePlaybackTracksImage
              tracks={activity.tracks}
              fullscreen={{ originUserId: activity.user.userId }}
              imageTw="shrink-0"

              // maxW="640px"
            />
          )}

          {activity.createdAt && (
            <p className="w-full text-[8px] opacity-60 md:text-[9px]">
              {timeSince(activity.createdAt)}
            </p>
          )}
          <SpotifyLogo icon w="21px" h="21px" />
        </div>
      </div>
    </div>
  );
};

export default ActivityPlayback;
