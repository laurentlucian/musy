import { Lock } from 'react-feather';

import { Button, Stack, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';

const BlockedProfile = ({ name }: { name: string }) => {
  const green = '#1DB954';
  const ghost = (
    <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
      <Lock size="210" color={green} />
    </motion.div>
  );
  return (
    <div>
      <Stack align="center">
        {ghost}
        <Text textAlign="center" opacity=".5">
          You have blocked {name}
        </Text>
        <Button
          w="300px"
          size="md"
          _hover={{ color: 'spotify.green' }}
          onClick={() => window.history.back()}
        >
          go back
        </Button>
      </Stack>
    </div>
  );
};

export default BlockedProfile;
