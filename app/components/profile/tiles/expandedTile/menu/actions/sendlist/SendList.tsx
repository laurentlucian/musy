import type { ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Box, Button, HStack } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import QueueToFriend from '~/components/profile/tiles/expandedTile/menu/actions/sendlist/QueuetoFriend';
import Recommend from '~/components/profile/tiles/expandedTile/menu/actions/sendlist/Recommend';
import { useQueueableUsers, useRecommendableUsers } from '~/hooks/useUsers';

const SendList = ({
  setShow,
  show,
  trackId,
}: {
  setShow: Dispatch<SetStateAction<number>>;
  show: number;
  trackId: string;
}) => {
  const queueableUsers = useQueueableUsers();
  const recommendableUsers = useRecommendableUsers();

  const ListLayout = ({ children }: { children: ReactNode }) => {
    return (
      <Box
        as={motion.div}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '100%', opacity: 1 }}
        overflowY="scroll"
        overflowX="hidden"
        w={['100vw', '300px']}
      >
        {children}
      </Box>
    );
  };

  const List = (
    <Box w={['100vw', '300px']} h="100%" overflow="hidden">
      {show === 1 ? (
        <ListLayout>
          {queueableUsers.map((user) => (
            <QueueToFriend
              key={user.userId}
              trackId={trackId}
              userId={user.userId}
              userImage={user.image}
              username={user.name}
            />
          ))}
        </ListLayout>
      ) : (
        <ListLayout>
          {recommendableUsers.map((user) => (
            <Recommend
              key={user.userId}
              userId={user.userId}
              userImage={user.image}
              username={user.name}
            />
          ))}
        </ListLayout>
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
