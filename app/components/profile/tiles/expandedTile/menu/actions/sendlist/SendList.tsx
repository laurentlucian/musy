import type { ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Box, IconButton, Stack } from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { ArrowLeft2 } from 'iconsax-react';

import QueueToFriend from '~/components/profile/tiles/expandedTile/menu/actions/sendlist/QueuetoFriend';
import { useQueueableUsers } from '~/hooks/useUsers';

const ListLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      overflowY="scroll"
      overflowX="hidden"
    >
      {children}
    </Box>
  );
};

const SendList = ({
  setShow,
  trackId,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  trackId: string;
}) => {
  const queueableUsers = useQueueableUsers();

  const List = (
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
  );

  const BackButton = (
    <IconButton
      aria-label="back"
      pr="5px"
      icon={<ArrowLeft2 />}
      variant="unstyled"
      onClick={() => setShow(false)}
    />
  );

  return (
    <Stack h={['unset', 500]} overflow="hidden" justify="space-between">
      {BackButton}
      {List}
    </Stack>
  );
};

export default SendList;
