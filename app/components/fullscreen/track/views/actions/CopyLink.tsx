import { useState } from 'react';

import { Link2, Link21 } from 'iconsax-react';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from './shared/ActionButton';

const CopyLink = () => {
  const { track } = useFullscreenTrack();
  const [isCopied, setIsCopied] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(track.link);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy link: ', err);
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
      {isCopied ? 'Copied!' : 'Copy Link'}
    </ActionButton>
  );
};

export default CopyLink;
