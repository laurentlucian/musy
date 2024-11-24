import { Link } from "@remix-run/react";

import type { Playlist } from "@prisma/client";

import { decodeHtmlEntity } from "~/lib/utils";

const ActivityPlaylistInfo = ({ playlist }: { playlist: Playlist }) => {
  return (
    <div className="stack-h-2 items-start">
      <div className="h-9 w-9 shrink-0">
        <img src={playlist.image} alt="playlist" />
      </div>
      <Link to={`/${playlist.userId}/${playlist.id}`}>
        <div className="group space-y-0">
          <p className="font-bold text-xs group-hover:underline">
            {playlist.name}
          </p>
          <p className="line-clamp-2 break-all text-[9px]">
            {decodeHtmlEntity(playlist.description)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ActivityPlaylistInfo;
