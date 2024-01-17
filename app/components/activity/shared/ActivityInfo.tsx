import { Send2, Star1 } from "iconsax-react";

import LikeIcon from "~/lib/icons/Like";
import type { Activity } from "~/lib/types/types";

import ActivityPlaylistInfo from "./ActivityPlaylistInfo";
import ActivityUserInfo from "./ActivityUserInfo";

const ActivityInfo = ({ activity }: { activity: Activity }) => {
  return (
    <div className="flex shrink-0 items-center justify-between space-x-12">
      <ActivityUserInfo user={activity.user} />

      {activity.liked && (
        <div className="stack-h-2 shrink-0 items-center">
          <p className="text-[10px] font-bold">LIKED</p>
          <LikeIcon aria-checked />
        </div>
      )}

      {activity.queue && (
        <div className="stack-h-2 shrink-0 items-center">
          <p className="text-[10px] font-bold">SENT</p>
          <Send2 size={20} fill="white" />
          {activity.queue.owner.user && (
            <ActivityUserInfo user={activity.queue.owner.user} />
          )}
        </div>
      )}

      {activity.recommend && (
        <div className="stack-h-2 shrink-0 items-center">
          <p className="text-[10px] font-bold">RECOMMENDED</p>
          <Star1 size="20px" fill="white" />
        </div>
      )}

      {activity.playlist && (
        <div className="stack-h-2 shrink-0 items-center">
          <p className="text-[10px] font-bold">ADDED TO</p>
          <ActivityPlaylistInfo playlist={activity.playlist.playlist} />
        </div>
      )}

      {/* {activity.playback && (
        <div className="flex items-center">
          <p className="text-[10px] font-bold uppercase">
            LISTENED FOR{' '}
            {timeBetween({
              endDate: activity.playback?.endedAt,
              startDate: activity.playback?.startedAt,
            })}
          </p>
          <Sound size="20px" fill="white" />
        </div>
      )} */}
    </div>
  );
};

export default ActivityInfo;
