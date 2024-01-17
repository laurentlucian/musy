import { useState } from "react";
import { Heart } from "react-feather";

import type { Profile } from "@prisma/client";

import Tooltip from "~/components/Tooltip";
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
    <div
      className="stack-h-1"
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
    >
      <Heart size={15} />
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <div className="stack-3 bg-musy-900 rounded-sm px-2 py-1">
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
          </div>
        }
      >
        <div className="flex -space-x-2 overflow-hidden">
          {props.liked.slice(0, slice).map(({ user }) => (
            <img
              alt="user-avatar"
              className="w-5 rounded-full"
              key={user?.userId}
              src={user?.image}
            />
          ))}
        </div>
      </Tooltip>
    </div>
  );
};

export default LikedBy;
