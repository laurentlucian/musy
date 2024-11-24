import { ArrowLeft2 } from "iconsax-react";

import ActionButton from "../../../shared/FullscreenActionButton";
import { useFullscreenTrack } from "../../FullscreenTrack";

const BackButton = () => {
  const { setView } = useFullscreenTrack();

  return (
    <ActionButton leftIcon={<ArrowLeft2 />} onClick={() => setView("default")}>
      Go back
    </ActionButton>
  );
};

export default BackButton;
