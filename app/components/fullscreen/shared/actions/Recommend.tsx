import { useRecommendData } from '~/hooks/useSendButton';

import ActionButton from '../FullscreenActionButton';

const Recommend = ({ trackId }: { trackId: string }) => {
  const { child, handleRecommend, isDisabled, leftIcon } = useRecommendData(trackId);

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
