import { Button, Icon, Text } from '@chakra-ui/react';

import { ArrowRight2, Send2 } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

const RecommendTo = () => {
  const currentUser = useSessionUser();

  const RecommendToFriend = (
    <Button
      leftIcon={<Send2 variant="Bold" />}
      // onClick={onClickRecommend}
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
          <Text>Recommend to Friend</Text>
          <Icon as={ArrowRight2} boxSize="25px" ml={['auto !important', '36px !important']} />
        </>
      ) : (
        'Log in to Recommend'
      )}
    </Button>
  );
  return RecommendToFriend;
};

export default RecommendTo;
