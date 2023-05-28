import { useParams } from '@remix-run/react';
import { useState } from 'react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import { UserAdd, UserMinus } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { action as followAction } from '~/routes/api/user/follow';

const FollowButton = (props: { id?: string }) => {
  const currentUser = useSessionUser();
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.userId);
  const [isFollowing, setIsfollowing] = useState<boolean>(!!isFollowingDefault);
  const color = useColorModeValue('#161616', '#EEE6E2');

  const params = useParams();
  const userId = (props.id || params.id) as string;

  const fetcher = useTypedFetcher<typeof followAction>();

  const label = isFollowing ? 'Unfollow' : 'Follow';

  const icon = isFollowing ? <UserMinus /> : <UserAdd />;

  return (
    <Tooltip label={label}>
      <IconButton
        aria-label="follow"
        variant="ghost"
        isLoading={fetcher.formAction?.includes(userId)}
        icon={icon}
        color={isFollowing ? 'spotify.green' : color}
        _hover={{ color: 'spotify.green' }}
        onClick={(e) => {
          e.preventDefault();
          if (currentUser) {
            setIsfollowing(!isFollowing);
            fetcher.submit(
              { currentUserId: currentUser.userId, isFollowing: String(isFollowing), userId },
              { action: `/api/user/follow`, method: 'post', replace: true },
            );
          }
        }}
      />
    </Tooltip>
  );
};

export default FollowButton;
