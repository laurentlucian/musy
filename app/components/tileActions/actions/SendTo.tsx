import { Button, Icon, Text } from '@chakra-ui/react';

import { ArrowRight2, Send2 } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

const SendTo = () => {
  const currentUser = useSessionUser();

  const AddToFriendsQueue = (
    <Button
      leftIcon={<Send2 />}
      // onClick={onClickQueue}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
      _hover={{ color: 'white' }}
      disabled={!currentUser}
    >
      {currentUser ? (
        <>
          <Text>Add to Friends Queue</Text>
          <Icon as={ArrowRight2} boxSize="25px" ml={['auto !important', '40px !important']} />
        </>
      ) : (
        'Log in to Send'
      )}
    </Button>
  );
  return AddToFriendsQueue;
};

export default SendTo;
