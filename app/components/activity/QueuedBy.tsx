import { useState } from "react";

import type { Profile } from "@prisma/client";
import { DirectInbox } from "iconsax-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/lib/ui/tooltip";
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
      <Tooltip open={isLabelOpen}>
        <TooltipTrigger>
          <div className="-space-x-2 flex overflow-hidden">
            {props.queued.slice(0, slice).map(({ owner: { user } }, index) => (
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
          {props.queued.map(({ owner: { user } }, index) => {
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
    </div>
  );
};

export default QueuedBy;
