import { Link } from "@remix-run/react";

import TileUserImage from "~/components/tile/user/TileUserImage";
import type { ProfileWithInfo } from "~/lib/types/types";

const ActivityUserInfo = ({ user }: { user: ProfileWithInfo }) => {
  return (
    <div className="stack-h-2">
      <TileUserImage user={user} size="35px" />
      <Link className="stack group" to={`/${user.userId}`}>
        <p className="line-clamp-1 text-xs font-bold group-hover:underline">
          {user.name}
        </p>
        <p className="line-clamp-2 shrink break-all text-[9px]">{user.bio}</p>
      </Link>
    </div>
  );
};

export default ActivityUserInfo;
