import { useState } from "react";

import type { Profile } from "@prisma/client";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Play } from "iconsax-react";

import { Tooltip, TooltipContent } from "~/lib/ui/tooltip";
import { shortenUsername } from "~/lib/utils";

const PlayedBy = (props: {
  played?: {
    user: Profile | null;
  }[];
  slice?: number;
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const slice = props.slice || 5;

  if (!props.played?.length) return null;
  return (
    <div
      className="stack-h-1"
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
    >
      <Play size={15} />
      <Tooltip open={isLabelOpen}>
        <TooltipTrigger>
          <div className="-space-x-2 flex overflow-hidden">
            {props.played.slice(0, slice).map(({ user }, index) => (
              <img
                className="w-5 rounded-full ring-2 ring-black"
                key={index}
                alt={user?.name}
                src={user?.image}
              />
            ))}
          </div>
        </TooltipTrigger>

        <TooltipContent>
          {Object.values(
            props.played.reduce(
              (acc: Record<string, { count: number; user: Profile }>, curr) => {
                if (!curr.user) return acc;
                const userId = curr.user.userId;
                if (!acc[userId]) {
                  acc[userId] = { count: 1, user: curr.user };
                } else {
                  acc[userId].count += 1;
                }
                return acc;
              },
              {},
            ),
          )
            .sort((a, b) => b.count - a.count)
            .map(({ count, user }) => {
              const name = shortenUsername(user.name);
              return (
                <div className="stack-h-2" key={user.name}>
                  <img
                    className="w-5 rounded-full"
                    alt={user?.name}
                    src={user?.image}
                  />
                  <p>{name}</p>
                  {count > 1 && <p>{count}x</p>}
                </div>
              );
            })}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default PlayedBy;
