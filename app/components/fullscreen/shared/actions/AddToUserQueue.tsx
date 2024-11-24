import { Send2 } from "iconsax-react";

import { useFullscreen } from "../../Fullscreen";
import FullscreenQueue from "../../queue/FullscreenQueue";
import ActionButton from "../FullscreenActionButton";

const AddToUserQueue = ({ userId }: { userId: string }) => {
  const { onOpen } = useFullscreen();

  return (
    <ActionButton
      leftIcon={<Send2 />}
      onClick={() => onOpen(<FullscreenQueue userId={userId} />)}
    >
      Add to queue
    </ActionButton>
  );
};

export default AddToUserQueue;
