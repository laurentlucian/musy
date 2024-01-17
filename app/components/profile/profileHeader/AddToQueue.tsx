import { useParams } from "@remix-run/react";

import { useFullscreen } from "~/components/fullscreen/Fullscreen";
import FullscreenQueue from "~/components/fullscreen/queue/FullscreenQueue";

const AddToQueueButton = (props: { id?: string }) => {
  const { onOpen } = useFullscreen();
  const params = useParams();
  const userId = (props.id || params.id) as string;

  return (
    <button
      className="rounded-sm border border-musy px-2 py-1.5 text-xs hover:bg-musy hover:text-musy-900 md:text-[13px]"
      onClick={(e) => {
        e.preventDefault();
        onOpen(<FullscreenQueue userId={userId} />);
      }}
    >
      Add to queue
    </button>
  );
};

export default AddToQueueButton;
