import { Button, HStack, Stack, Text } from '@chakra-ui/react';
import { Ghost, LockCircle } from 'iconsax-react';
import { motion } from 'framer-motion';

const PrivateProfile = () => {
  const green = '#1DB954';

  const ghost = (
    <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
      <Ghost size="32" color={green} />
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
      <Stack w="100%" align="center">
        <LockCircle size="32" color={green} variant="Bulk" />
        <HStack>
          {ghost}
          <Text>This Profile is Hidden</Text>
          {ghost}
        </HStack>

        <Button _hover={{ color: 'spotify.green' }} onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Stack>
    </motion.div>
  );
};

export default PrivateProfile;
