import { useParams } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenQueue from '~/components/fullscreen/queue/FullscreenQueue';

const AddToQueueButton = (props: { id?: string }) => {
  const { onOpen } = useFullscreen();
  const params = useParams();
  const userId = (props.id || params.id) as string;

  return (
    <Button
      variant="musy"
      fontSize={['12px', '13px']}
      h={['27px', '30px']}
      w={['100%', '120px']}
      onClick={(e) => {
        e.preventDefault();
        onOpen(<FullscreenQueue userId={userId} />);
      }}
    >
      Add to queue
    </Button>
  );
};

export default AddToQueueButton;
