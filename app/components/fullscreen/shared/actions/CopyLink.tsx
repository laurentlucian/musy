import { useState } from "react";

import { Link2, Link21 } from "iconsax-react";

import ActionButton from "../FullscreenActionButton";

const CopyLink = ({ trackLink }: { trackLink: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(trackLink);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  }

  return (
    <ActionButton
      leftIcon={mouseDown ? <Link2 /> : <Link21 />}
      onClick={handleClick}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseLeave={() => setIsCopied(false)}
    >
      {isCopied ? "Copied!" : "Copy Link"}
    </ActionButton>
  );
};

export default CopyLink;
