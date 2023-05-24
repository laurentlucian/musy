import { Star1 } from 'iconsax-react';

import { useFullscreenTileStore } from '~/hooks/useFullscreenTileStore';
import { useRecommendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

import ActionButton from './shared/ActionButton';

const Recommend = () => {
  const track = useFullscreenTileStore();

  const { handleRecommend, isAdding, isDone, isError, text } = useRecommendData({
    trackId: track?.id ?? '',
  });

  return (
    <ActionButton
      onClick={handleRecommend}
      leftIcon={<Star1 />}
      isDisabled={!!isDone || !!isError || !!isAdding}
      w={['100vw', '100%']}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default Recommend;
