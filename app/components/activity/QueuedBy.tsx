import { useState } from "react";

import type { Profile } from "@prisma/client";
import { DirectInbox } from "iconsax-react";

import Tooltip from "~/components/Tooltip";
import { shortenUsername } from "~/lib/utils";

const QueuedBy = (props: {
  queued?: {
    owner: { user: Profile | null };
  }[];
  slice?: number;
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const slice = props.slice || 5;

  if (!props.queued?.length) return null;
  return (
    <div
      className="stack-h-1"
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
    >
      <DirectInbox size={15} />
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <div className="stack-3 bg-musy-900 rounded-sm px-2 py-1">
            {props.queued.map(({ owner: { user } }, index) => {
              const name = shortenUsername(user?.name);
              return (
                <div className="flex" key={index}>
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
          {props.queued.slice(0, slice).map(({ owner: { user } }) => (
            <img
              className="w-5 rounded-full ring-2 ring-black"
              key={user?.userId}
              alt={user?.name}
              src={user?.image}
            />
          ))}
        </div>
      </Tooltip>
    </div>
  );
};

export default QueuedBy;
