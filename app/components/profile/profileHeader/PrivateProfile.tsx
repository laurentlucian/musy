import { Button, Stack, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { Ghost } from 'iconsax-react';

const PrivateProfile = ({ name }: { name: string }) => {
  const green = '#1DB954';

  const ghost = (
    <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
      <Ghost size="210" color={green} />
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
      <Stack align="center">
        {ghost}
        <Text textAlign="center" opacity=".5">
          {name}&apos;s profile is private
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
    </motion.div>
  );
};

export default PrivateProfile;
