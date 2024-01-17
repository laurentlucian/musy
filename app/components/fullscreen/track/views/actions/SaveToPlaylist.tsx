import { useLocation } from "@remix-run/react";
import { useState } from "react";

import { useTypedFetcher } from "remix-typedjson";

import useCurrentUser from "~/hooks/useCurrentUser";
import LikeIcon from "~/lib/icons/Like";
import Waver from "~/lib/icons/Waver";

import ActionButton from "../../../shared/FullscreenActionButton";
import { useFullscreenTrack } from "../../FullscreenTrack";

const SaveToPlaylist = () => {
  const { track } = useFullscreenTrack();
  const [isSaved, setIsSaved] = useState(false);
  const currentUser = useCurrentUser();
  const userId = currentUser?.userId;
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();

  const saveSong = () => {
    setIsSaved(!isSaved);
    if (!userId) {
      return fetcher.submit(
        {},
        { action: "/api/auth/spotify?returnTo=" + pathname + search },
      );
    }

    fetcher.submit(
      { trackId: track.id, userId },
      { action: "api/playlist/save", method: "post" },
    );
  };

  const isAdding = fetcher.formData?.get("trackId") === track.id;
  const isDone = fetcher.state === "idle" && fetcher.data != null;
  const isError =
    typeof fetcher.data === "string"
      ? fetcher.data.includes("Error")
        ? fetcher.data
        : null
      : null;

  return (
    <>
      <ActionButton
        onClick={saveSong}
        leftIcon={<LikeIcon aria-checked={isSaved} />}
        disabled={!!isDone || !!isError || !!isAdding}
      >
        {isAdding ? <Waver /> : fetcher.data ? fetcher.data : "Save"}
      </ActionButton>
    </>
  );
};

export default SaveToPlaylist;
