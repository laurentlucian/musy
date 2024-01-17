import { useParams } from '@remix-run/react';
import { useState } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import useCurrentUser from '~/hooks/useCurrentUser';
import type { action as followAction } from '~/routes/api+/user+/follow';

const FollowButton = (props: { id?: string }) => {
  const currentUser = useCurrentUser();
  const params = useParams();
  const userId = (props.id || params.id) as string;
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.followingId);
  const [isFollowing, setIsFollowing] = useState<boolean>(!!isFollowingDefault);

  const fetcher = useTypedFetcher<typeof followAction>();

  return (
    <button
      disabled={fetcher.formAction?.includes(userId)}
      onClick={(e) => {
        e.preventDefault();
        if (currentUser) {
          setIsFollowing(!isFollowing);
          fetcher.submit(
            {
              currentUserId: currentUser.userId,
              isFollowing: String(isFollowing),
              userId,
            },
            { action: `/api/user/follow`, method: 'POST' },
          );
        }
      }}
      type='submit'
      className='rounded-sm border border-musy px-2 py-1.5 text-xs hover:bg-musy hover:text-musy-900 md:text-[13px]'
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
