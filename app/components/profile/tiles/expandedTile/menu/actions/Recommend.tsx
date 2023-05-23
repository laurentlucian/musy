import { Button, Image } from '@chakra-ui/react';

import { Star1 } from 'iconsax-react';

import { useExpandedTile } from '~/hooks/useExpandedTileState';
import { useRecommendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

const Recommend = () => {
  const track = useExpandedTile();

  const { handleRecommend, isAdding, isDone, isError, text } = useRecommendData({
    trackId: track?.id ?? '',
  });

  return (
    <Button
      onClick={handleRecommend}
      leftIcon={<Star1 />}
      isDisabled={!!isDone || !!isError || !!isAdding}
      variant="ghost"
      justifyContent="left"
      color="musy.200"
      mr="0px"
      _hover={{ color: 'white' }}
      w={['100vw', '100%']}
    >
      {isAdding ? <Waver /> : text}
    </Button>
  );
};

export default Recommend;
