import type { ProfileWithInfo } from "~/lib/types/types";

import FullscreenFadeLayout from "../shared/FullscreenFadeLayout";
import FullscreenPlaybackActive from "./FullscreenPlaybackActive";
import FullscreenPlaybackInactive from "./FullscreenPlaybackInactive";

const FullscreenPlayback = ({ user }: { user: ProfileWithInfo }) => {
  return (
    <FullscreenFadeLayout>
      {user.playback ? (
        <FullscreenPlaybackActive user={user} />
      ) : (
        <FullscreenPlaybackInactive user={user} />
      )}
    </FullscreenFadeLayout>
  );
};

export default FullscreenPlayback;
