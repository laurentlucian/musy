import { useLocation } from "@remix-run/react";
import { Heart } from "react-feather";

import clsx from "clsx";
import { useTypedFetcher } from "remix-typedjson";

import Tooltip from "~/components/Tooltip";
import useCurrentUser from "~/hooks/useCurrentUser";
import useUserLibrary from "~/hooks/useUserLibrary";

import ActionButton from "../FullscreenActionButton";

type SaveToLikedProps = {
  iconOnly?: boolean;
  trackId: string;
};

const SaveToLiked = ({ iconOnly, trackId }: SaveToLikedProps) => {
  const currentUser = useCurrentUser();
  const { isSaved, toggleSave } = useUserLibrary(trackId);
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();
  const userId = currentUser?.userId;

  const saveSong = () => {
    toggleSave(trackId);
    if (!userId) {
      return fetcher.submit(
        {},
        { action: "/api/auth/spotify?returnTo=" + pathname + search },
      );
    }

    fetcher.submit(
      { state: `${isSaved}`, trackId, userId },
      { action: "api/track/save", method: "POST" },
    );
  };

  if (iconOnly)
    return (
      <Tooltip label={isSaved ? "remove" : "save"} placement="top">
        <button
          aria-label={isSaved ? "remove" : "save"}
          className="shadow-none hover:shadow-none active:shadow-none"
          onClick={saveSong}
        >
          <Heart
            className={clsx({
              "fill-musy-200": isSaved,
            })}
          />
        </button>
      </Tooltip>
    );

  return (
    <ActionButton
      onClick={saveSong}
      leftIcon={
        <Heart
          className={clsx("stroke-1", {
            "fill-musy-200": isSaved,
          })}
        />
      }
      disabled={!currentUser}
    >
      {isSaved ? "Liked" : "Like"}
    </ActionButton>
  );
};

export default SaveToLiked;
