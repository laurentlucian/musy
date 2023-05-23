import { type Dispatch, type SetStateAction } from 'react';

import { Button } from '@chakra-ui/react';

import { Send2 } from 'iconsax-react';

const ToggleQueueList = ({ setShow }: { setShow: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <Button
      leftIcon={<Send2 />}
      onClick={() => setShow(true)}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '100%']}
      color="musy.200"
      justifyContent="left"
      _hover={{ color: 'white' }}
    >
      Add to friend's
    </Button>
  );
};

export default ToggleQueueList;
