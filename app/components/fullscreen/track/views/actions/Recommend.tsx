import { useRecommendData } from '~/hooks/useSendButton';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from './shared/ActionButton';

const Recommend = () => {
  const { track } = useFullscreenTrack();

  const { child, handleRecommend, isDisabled, leftIcon } = useRecommendData(track.id);

  return (
    <ActionButton
      onClick={handleRecommend}
      leftIcon={leftIcon}
      isDisabled={isDisabled}
      w={['100vw', '100%']}
    >
      {child}
    </ActionButton>
  );
};

export default Recommend;
