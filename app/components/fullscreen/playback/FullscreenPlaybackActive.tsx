import { AnimatePresence, motion } from "framer-motion";
import { Sound } from "iconsax-react";

import ActivityTrackInfo from "~/components/activity/shared/ActivityTrackInfo";
import ActivityUserInfo from "~/components/activity/shared/ActivityUserInfo";
import TileTrackImage from "~/components/tile/track/TileTrackImage";
import TileTrackInfo from "~/components/tile/track/TileTrackInfo";
import Tiles from "~/components/tiles/Tiles";
import usePlaybackTracks from "~/hooks/usePlaybackTracks";
import type { ProfileWithInfo } from "~/lib/types/types";
import { timeBetween } from "~/lib/utils";

import TrackInfo from "../shared/FullscreenTrackInfo";
import AddToUserQueue from "../shared/actions/AddToUserQueue";
import ViewTrack from "../shared/actions/ViewTrack";
import PlaybackListenAlong from "./PlaybackListenAlong";

const FullscreenPlaybackActive = ({ user }: { user: ProfileWithInfo }) => {
  if (!user.playback) throw new Error("User has no playback");
  const tracks = usePlaybackTracks(user);
  const tracksWithoutCurrentPlayback = tracks?.slice(1);
  const track = user.playback.track;

  return (
    <div className="grid grid-cols-1 content-start overflow-hidden md:grid-cols-2 md:content-center">
      <div className="stack-2 mx-auto mt-14 items-center md:mt-0 md:items-start">
        <div
          className="stack-h-2 w-2/3 justify-between md:mt-[-42px]"
          id="dont-close"
        >
          <ActivityUserInfo user={user} />
          <div className="stack-h-2 shrink-0">
            <p className="font-bold text-[10px] uppercase">
              LISTENING FOR{" "}
              {timeBetween({
                endDate: new Date(),
                startDate: user.playback.createdAt,
              })}
            </p>
            <Sound size={20} />
          </div>
        </div>

        <div className="stack w-2/3">
          <TileTrackImage
            fullscreen={{
              originUserId: user.userId,
              track,
            }}
            image={{
              src: track.image,
            }}
          />
          <ActivityTrackInfo track={track} />
          <TrackInfo track={track} />
        </div>
      </div>
      <div className="stack grow overflow-x-hidden pt-2">
        {/* <PlaybackListenAlong />
        <AddToUserQueue userId={user.userId} />
        <ViewTrack track={track} userId={user.userId} /> */}
        <AnimatePresence>
          {!!tracksWithoutCurrentPlayback?.length && (
            <motion.div // no needed because tiletrackimage already has opacity animation
              initial={{ opacity: 0 }} // but this motion.div is preventing layout shift
              animate={{ opacity: 1 }}
              transition={{ duration: "1" }}
            >
              <Tiles title="LISTENED">
                {tracksWithoutCurrentPlayback.map((track, index) => (
                  <div className="stack-2 shrink-0" key={index}>
                    <TileTrackImage
                      box="w-[200px]"
                      image={{ src: track.image }}
                      fullscreen={{
                        originUserId: user.userId,
                        track,
                      }}
                    />
                    <ActivityTrackInfo track={track} />
                    <TileTrackInfo track={track} icon={false} />
                  </div>
                ))}
              </Tiles>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FullscreenPlaybackActive;
