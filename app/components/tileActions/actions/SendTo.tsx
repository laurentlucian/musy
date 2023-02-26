import { type Dispatch, type SetStateAction } from 'react';

import { Button } from '@chakra-ui/react';

import { Send2 } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

const SendTo = ({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<number>>;
}) => {
  const currentUser = useSessionUser();
  const handleClick = () => {
    setShow(1);
  };

  const AddToFriendsQueue = (
    <>
      <Button
        leftIcon={<Send2 />}
        onClick={handleClick}
        pos="relative"
        variant="ghost"
        mx="25px"
        w={['100vw', '100%']}
        justifyContent="left"
        _hover={{ color: 'white' }}
        disabled={!currentUser}
      >
        {currentUser ? 'Add to Friends Queue' : 'Log in to Send'}
      </Button>
    </>
  );
  return AddToFriendsQueue;
};

export default SendTo;
