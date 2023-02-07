import { Button, HStack, Stack, Text } from '@chakra-ui/react';
import { Profile } from '@prisma/client';

import { motion } from 'framer-motion';
import { Ghost, LockCircle } from 'iconsax-react';

const PrivateProfile = ({ name }: { name: string }) => {
  const green = '#1DB954';

  const ghost = (
    <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
      <Ghost size="32" color={green} />
    </motion.div>
  );
  console.log(name, 'user');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
      <Stack w="100%" align="center">
        {ghost}
        <Text textAlign="center" fontSize="32px" fontWeight="bold">
          oops the content for {name} are hidden
        </Text>
        <Text textAlign="center" maxW="300px" opacity=".25">
          it looks like {name} has set their account private tell them to make it public to view
          their content
        </Text>
        <Button _hover={{ color: 'spotify.green' }} onClick={() => window.history.back()}>
          go back
        </Button>
      </Stack>
    </motion.div>
  );
};

export default PrivateProfile;
