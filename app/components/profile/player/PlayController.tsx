import type { FetcherWithComponents } from "@remix-run/react";

import { Next, Pause, Play, Previous } from "iconsax-react";

import Tooltip from "~/components/Tooltip";

import SaveToLiked from "../../fullscreen/shared/actions/SaveToLiked";

type PlayControllerProps = {
  fetcher: FetcherWithComponents<any>;
  id: string;
  playback: SpotifyApi.CurrentlyPlayingResponse;
};

const PlayController = ({ fetcher, id, playback }: PlayControllerProps) => {
  const loading = fetcher.formData?.has("play") ?? false;
  const prevSong = fetcher.formData?.has("prev") ?? false;
  const nextSong = fetcher.formData?.has("next") ?? false;
  const trackId = playback.item?.id;

  return null;
};

export default PlayController;
