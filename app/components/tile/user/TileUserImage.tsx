import { useNavigate } from "@remix-run/react";

import { useFullscreen } from "~/components/fullscreen/Fullscreen";
import FullscreenPlayback from "~/components/fullscreen/playback/FullscreenPlayback";
import { cn } from "~/lib/cn";
import type { ProfileWithInfo } from "~/lib/types/types";

const TileUserImage = ({
  size = "50px",
  user,
}: {
  size?: string;
  user: ProfileWithInfo;
}) => {
  const { components, onOpen } = useFullscreen();
  const navigate = useNavigate();

  const isFullscreen = components.length > 0;

  return (
    <button
      style={{
        height: size,
        width: size,
      }}
      className={cn(
        "relative shrink-0 cursor-pointer overflow-hidden rounded-[50%] border-[1.5px] border-transparent hover:border-white",
        {
          "border-musy-200": user.playback,
        },
      )}
      onClick={(e) => {
        if (user.playback && !isFullscreen) {
          e.preventDefault();
          onOpen(<FullscreenPlayback user={user} />);
        } else {
          navigate(`/${user.userId}`);
        }
      }}
    >
      {user.playback && (
        <div className="absolute bottom-0 left-0 right-0 top-0 rounded-full border-2 border-black" />
      )}
      <img
        src={user.image}
        alt="user-profile"
        className="h-full w-full object-cover"
      />
    </button>
  );
};

export default TileUserImage;
