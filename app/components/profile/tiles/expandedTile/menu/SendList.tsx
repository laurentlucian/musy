import { type Dispatch, type SetStateAction } from 'react';

import { Box, Button, HStack } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import QueueToFriend from '~/components/profile/tiles/expandedTile/menu/actions/QueuetoFriend';
import Recommend from '~/components/profile/tiles/expandedTile/menu/actions/Recommend';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';

const SendList = ({
  setShow,
  show,
  trackId,
}: {
  setShow: Dispatch<SetStateAction<number>>;
  show: number;
  trackId: string;
}) => {
  const currentUser = useSessionUser();
  const users = useUsers();

  const queueableUsers = users.filter((user) => {
    const isAllowed =
      user.settings === null ||
      user.settings.allowQueue === null ||
      user.settings.allowQueue === 'on';
    return user.userId !== currentUser?.userId && isAllowed;
  });

  const recommendableUsers = users.filter((user) => {
    const isAllowed =
      user.settings === null ||
      user.settings.allowRecommend === null ||
      user.settings.allowRecommend === 'on';
    return user.userId !== currentUser?.userId && isAllowed;
  });

  const List = (
    <Box w={['100vw', '300px']} h="100%" overflow="hidden">
      {show === 1 ? (
        <Box
          as={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: '100%', opacity: 1 }}
          overflowY="scroll"
          overflowX="hidden"
          w={['100vw', '300px']}
        >
          {queueableUsers.map((user) => (
            <QueueToFriend
              key={user.userId}
              trackId={trackId}
              userId={user.userId}
              userImage={user.image}
              username={user.name}
            />
          ))}
        </Box>
      ) : (
        <Box
          as={motion.div}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: '100%', opacity: 1 }}
          overflowY="scroll"
          overflowX="hidden"
          w={['100vw', '300px']}
        >
          {recommendableUsers.map((user) => (
            <Recommend
              key={user.userId}
              userId={user.userId}
              userImage={user.image}
              username={user.name}
            />
          ))}
        </Box>
      )}
    </Box>
  );
  const BackButton = (
    <Button
      variant="ghost"
      onClick={() => setShow(0)}
      w="120px"
      alignSelf="start"
      mr="18px !important"
    >
      back
    </Button>
  );

  return (
    <HStack w="400px" h={['311px', '369px', 500]} overflow="hidden" justifyItems="space-between">
      {List}
      {BackButton}
    </HStack>
  );
};

export default SendList;
