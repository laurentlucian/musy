import type { Profile } from "@prisma/client";
import { useState } from "react";
import { Heart } from "react-feather";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/lib/ui/tooltip";
import { shortenUsername } from "~/lib/utils";

const LikedBy = (props: {
  liked?: {
    user: Profile | null;
  }[];
  slice?: number;
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const slice = props.slice || 5;

  if (!props.liked?.length) return null;
  return (
    <button
      type="button"
      className="stack-h-1"
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen((prev) => !prev)}
    >
      <Heart size={15} />
      <Tooltip open={isLabelOpen}>
        <TooltipTrigger>
          <div className="-space-x-2 flex overflow-hidden">
            {props.liked.slice(0, slice).map(({ user }) => (
              <img
                alt="user-avatar"
                className="w-5 rounded-full"
                key={user?.userId}
                src={user?.image}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {props.liked.map(({ user }, index) => {
            const name = shortenUsername(user?.name);
            return (
              <div className="stack-h-2" key={index}>
                <img
                  className="w-5 rounded-full"
                  alt={user?.name}
                  src={user?.image}
                />
                <p>{name}</p>
              </div>
            );
          })}
        </TooltipContent>
      </Tooltip>
    </button>
  );
};

export default LikedBy;
