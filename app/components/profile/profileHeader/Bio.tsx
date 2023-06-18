import { Text, Textarea } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import useIsMobile from '~/hooks/useIsMobile';
import type { action as bioAction } from '~/routes/api/user/profile/bio';

const Bio = ({ bio, isOwnProfile }: { bio: string | null; isOwnProfile: boolean }) => {
  const fetcher = useTypedFetcher<typeof bioAction>();
  const isSmallScreen = useIsMobile();

  const updateBio = (bio: string) => {
    fetcher.submit({ bio }, { action: '/api/user/profile/bio', method: 'post', replace: true });
  };

  return isOwnProfile ? (
    <Textarea
      name="bio"
      size="md"
      variant="flushed"
      defaultValue={bio ?? ''}
      placeholder="write something :)"
      onBlur={(e) => updateBio(e.currentTarget.value)}
      resize="none"
      maxLength={74}
      rows={2}
      py={0}
      focusBorderColor="spotify.green"
      w={isSmallScreen ? '100%' : '50%'}
      spellCheck={false}
      minH="20px"
      overflow="hidden"
      fontSize={['12px', '14px']}
      pt="10px"
    />
  ) : (
    <Text
      fontSize={['12px', '14px']}
      noOfLines={3}
      whiteSpace="normal"
      wordBreak="break-all"
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
