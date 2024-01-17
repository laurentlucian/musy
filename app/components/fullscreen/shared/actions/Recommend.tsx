import { useRecommendData } from '~/hooks/useSendButton';

import ActionButton from '../FullscreenActionButton';

const Recommend = ({ trackId }: { trackId: string }) => {
  const { child, handleRecommend, isDisabled, leftIcon } = useRecommendData(trackId);

  return (
    <ActionButton onClick={handleRecommend} leftIcon={leftIcon} disabled={isDisabled}>
      {child}
    </ActionButton>
  );
};

export default Recommend;
