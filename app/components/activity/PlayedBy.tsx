import { useState } from "react";

import type { Profile } from "@prisma/client";
import { Play } from "iconsax-react";

import Tooltip from "~/components/Tooltip";
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
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <div className="stack-3 bg-musy-900 rounded-sm px-2 py-1">
            {Object.values(
              props.played.reduce(
                (
                  acc: Record<string, { count: number; user: Profile }>,
                  curr,
                ) => {
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
          </div>
        }
      >
        <div className="flex -space-x-2 overflow-hidden">
          {props.played.slice(0, slice).map(({ user }, index) => (
            <img
              className="w-5 rounded-full ring-2 ring-black"
              key={index}
              alt={user?.name}
              src={user?.image}
            />
          ))}
        </div>
      </Tooltip>
    </div>
  );
};

export default PlayedBy;
