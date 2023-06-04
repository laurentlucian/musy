import { Stack, Text } from '@chakra-ui/react';

const CommentList = () => {
  return (
    <Stack overflowX="hidden" px={['10px']}>
      {[...Array(100)].map((_, i) => (
        <Text key={i} py="8px">
          oioioi
        </Text>
      ))}
    </Stack>
  );
};

export default CommentList;
