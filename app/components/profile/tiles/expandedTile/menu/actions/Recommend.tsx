import { Button, Image } from '@chakra-ui/react';

import { useExpandedTile } from '~/hooks/useExpandedTileState';
import { useRecommendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

type RecommendProps = {
  userId: string;
  userImage: string;
  username: string;
};

const Recommend = ({ userId, userImage, username }: RecommendProps) => {
  const track = useExpandedTile();

  const { handleRecommend, isAdding, isDone, isError, text } = useRecommendData({
    trackId: track?.id ?? '',
    userId,
    username,
  });

  return (
    <Button
      onClick={handleRecommend}
      isDisabled={!!isDone || !!isError || !!isAdding}
      variant="ghost"
      justifyContent="left"
      fontSize="18px"
      py="30px"
      w={['100vw', '550px']}
      mt="10px"
    >
      <Image src={userImage} borderRadius="full" boxSize="50px" minW="50px" mb={1} mr="10px" />
      {isAdding ? <Waver /> : text}
    </Button>
  );
};

export default Recommend;
