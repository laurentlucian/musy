import { type Dispatch, type SetStateAction } from 'react';

import { Button } from '@chakra-ui/react';

import { Send2 } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

const RecommendTo = ({ setShow }: { setShow: Dispatch<SetStateAction<number>> }) => {
  const currentUser = useSessionUser();
  const handleClick = () => {
    setShow(2);
  };

  const RecommendToFriend = (
    <Button
      leftIcon={<Send2 variant="Bold" />}
      onClick={handleClick}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '100%']}
      justifyContent="left"
      _hover={{ color: 'white' }}
      disabled={!currentUser}
    >
      {currentUser ? 'Recommend to Friend' : 'Log in to Recommend'}
    </Button>
  );
  return RecommendToFriend;
};

export default RecommendTo;
