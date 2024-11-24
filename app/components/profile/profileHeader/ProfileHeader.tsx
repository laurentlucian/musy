import { useSearchParams } from "@remix-run/react";
import { Fragment } from "react";

import { CodeCircle } from "iconsax-react";
import { useTypedRouteLoaderData } from "remix-typedjson";

import MoodButton from "~/components/profile/profileHeader/MoodButton";
import useCurrentUser from "~/hooks/useCurrentUser";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/lib/ui/tooltip";
import type { loader } from "~/routes/$id";

import PrivateBadge from "../badges/PrivateBadge";
import AddToQueue from "./AddToQueue";
import Bio from "./Bio";
import FollowButton from "./FollowButton";

const ProfileHeader = () => {
  const data = useTypedRouteLoaderData<typeof loader>("routes/$id");
  const [params, setParams] = useSearchParams();
  const currentUser = useCurrentUser();

  if (!data) return null;

  const { listened, user } = data;
  const isOwnProfile = currentUser?.userId === user.userId;

  const ProfilePic = (
    <a
      href={`spotify:user:${user.userId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        className="h-[100px] max-h-[100px] w-[100px] max-w-[100px] cursor-pointer rounded-full border-2 border-transparent object-cover hover:border-musy-200 sm:mr-[10px] sm:h-[150px] sm:max-h-[150px] sm:w-[150px] sm:max-w-[150px] md:h-[200px] md:max-h-[200px] md:w-[200px] md:max-w-[200px]"
        alt="user-profile"
        src={user.image}
      />
    </a>
  );

  const Username = (
    <div className="stack-2">
      <div className="stack-h-2">
        <a
          href={`spotify:user:${user.userId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h1 className="text-left font-bold hover:underline md:text-lg">
            {user.name}
          </h1>
        </a>
      </div>
      <PrivateBadge />
      {user.settings?.founder === true && (
        <CodeCircle size="32" variant="Bulk" />
      )}
    </div>
  );

  const timeframe = params.get("listened") === "week" ? "7d" : "24h";
  const SubHeader = (
    <Fragment>
      <Tooltip>
        <TooltipTrigger
          onClick={() => {
            if (params.get("listened") === "week") {
              params.delete("listened");
              setParams(params);
            } else {
              setParams({ listened: "week" });
            }
          }}
        >
          <div className="flex cursor-pointer items-baseline pt-[1px]">
            <p className="mr-1 text-[10px] md:text-[13px]">{listened}</p>
            <span className="pl-1 text-[9px] opacity-50 md:text-[10px]">
              /&nbsp; {timeframe}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>hours listened</TooltipContent>
      </Tooltip>
      <MoodButton mood={user.ai?.mood} since={user.ai?.updatedAt} />
    </Fragment>
  );

  const Buttons = (
    <div className="stack-h-2 max-w-full md:max-w-fit">
      <FollowButton />
      <AddToQueue />
    </div>
  );

  return (
    <div className="stack-h-2">
      <div className="stack-2">
        {ProfilePic}
        <div className="stack items-center">{SubHeader}</div>
      </div>
      <div className="stack-1 grow self-start">
        <div className="stack-3">
          {Username}
          {!isOwnProfile && Buttons}
        </div>
        <Bio bio={user.bio} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  );
};

export default ProfileHeader;
