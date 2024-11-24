import { Link, useNavigation } from "@remix-run/react";

import FollowButton from "~/components/profile/profileHeader/FollowButton";
import useIsFollowing from "~/hooks/useIsFollowing";
import useIsMobile from "~/hooks/useIsMobile";
import Waver from "~/lib/icons/Waver";
import type { ProfileWithInfo } from "~/lib/types/types";
import { shortenUsername } from "~/lib/utils";

import TileUserImage from "../tile/user/TileUserImage";
import SendSongButton from "./profileHeader/AddToQueue";

const ProfileButton = ({ user }: { user: ProfileWithInfo }) => {
  const navigation = useNavigation();
  const isSmallScreen = useIsMobile();
  const name = shortenUsername(user.name);
  const loading = navigation.location?.pathname.includes(user.userId);
  const isFollowing = useIsFollowing(user.userId);

  const Username = <p className="text-sm font-bold">{name}</p>;

  const Actions = (
    <div className="max-w-[130px]">
      {isFollowing ? (
        <SendSongButton id={user.userId} />
      ) : (
        <FollowButton id={user.userId} />
      )}
    </div>
  );

  const User = (
    <div className="flex w-full items-center justify-between pr-2">
      <div className="stack-h-2">
        <TileUserImage user={user} />
        {loading ? (
          <Waver />
        ) : (
          <div className="stack-1">
            {Username}

            {user.bio && (
              <p className="h-5 text-[9px] opacity-80 md:text-[11px]">
                {user.bio.slice(0, isSmallScreen ? 14 : 50)}
              </p>
            )}
          </div>
        )}
      </div>
      {Actions}
    </div>
  );

  return (
    <Link
      to={`/${user.userId}`}
      prefetch="intent"
      className="flex h-16 items-center rounded-sm pl-[2px] pr-0 hover:bg-[#10101066] hover:backdrop-blur-[27px] md:pl-2"
    >
      {User}
    </Link>
  );
};

export default ProfileButton;
