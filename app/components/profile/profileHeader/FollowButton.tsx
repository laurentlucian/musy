import { useParams } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import type { action as followAction } from '~/routes/api/user/follow';

const FollowButton = (props: { id?: string }) => {
  const currentUser = useSessionUser();
  const params = useParams();
  const userId = (props.id || params.id) as string;
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.followingId);
  const [isFollowing, setIsfollowing] = useState<boolean>(!!isFollowingDefault);

  const fetcher = useTypedFetcher<typeof followAction>();

  return (
    <Button
      isLoading={fetcher.formAction?.includes(userId)}
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
      type="submit"
      variant="musy"
      fontSize={['12px', '13px']}
      h={['27px', '30px']}
      w="100px"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
