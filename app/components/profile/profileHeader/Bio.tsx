import { useParams } from '@remix-run/react';

import { Stack, Text, Textarea } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import useIsMobile from '~/hooks/useIsMobile';
import type { action as bioAction } from '~/routes/api/user/profile/bio';

const Bio = ({ bio, isOwnProfile }: { bio: string | null; isOwnProfile: boolean }) => {
  const fetcher = useTypedFetcher<typeof bioAction>();
  const isSmallScreen = useIsMobile();
  const { id } = useParams();

  const updateBio = (bio: string) => {
    fetcher.submit(
      { bio, userId: id ?? ':)' },
      { action: '/api/user/profile/bio', method: 'post', replace: true },
    );
  };

  return isOwnProfile ? (
    <Stack w="100%" minW="100%" maxW="100%" pt="20px">
      <Textarea
        name="bio"
        size="md"
        variant="flushed"
        defaultValue={bio ?? ''}
        placeholder="write something :)"
        onBlur={(e) => updateBio(e.currentTarget.value)}
        resize="none"
        maxLength={75}
        rows={2}
        py={0}
        focusBorderColor="spotify.green"
        w={isSmallScreen ? '100%' : '50%'}
        spellCheck={false}
        h="100%"
        minH="20px"
        overflow="hidden"
      />
    </Stack>
  ) : (
    <Text
      fontSize="14px"
      noOfLines={3}
      whiteSpace="normal"
      wordBreak="break-word"
      w="100%"
      spellCheck={false}
      h="100%"
      minH="20px"
      pt="20px"
    >
      {bio}
    </Text>
  );
};

export default Bio;
