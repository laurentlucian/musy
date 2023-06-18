import { useParams } from '@remix-run/react';

import { Button, HStack, Stack, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { Forbidden } from 'iconsax-react';

import useCurrentUser from '~/hooks/useCurrentUser';

const block = (
  <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
    <Forbidden size="30" color="red" />
  </motion.div>
);

const BlockedProfile = ({ name }: { name: string }) => {
  const currentUser = useCurrentUser();
  const { id } = useParams();
  const blockRecord = currentUser?.block.find((blocked) => blocked.blockedId === id);
  const amIBlocked = blockRecord?.blockedId === currentUser?.userId;

  return (
    <Stack spacing={5} px={5}>
      <HStack>
        {block}
        <Text opacity=".5">
          {amIBlocked ? `You have been blocked by ${name}` : `You have blocked ${name}`}
        </Text>
      </HStack>
      <Button
        w="300px"
        size="md"
        _hover={{ color: 'spotify.green' }}
        onClick={() => window.history.back()}
      >
        go back
      </Button>
    </Stack>
  );
};

export default BlockedProfile;
