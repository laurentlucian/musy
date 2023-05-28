import { useParams } from '@remix-run/react';
import { useState } from 'react';

import { Button, IconButton, useColorModeValue } from '@chakra-ui/react';

import { UserAdd, UserMinus } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { action as followAction } from '~/routes/api/user/follow';

const FollowButton = (props: { id?: string }) => {
  const currentUser = useSessionUser();
  const params = useParams();
  const userId = (props.id || params.id) as string;
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.followingId);
  const [isFollowing, setIsfollowing] = useState<boolean>(!!isFollowingDefault);
  const color = useColorModeValue('#161616', '#EEE6E2');

  const fetcher = useTypedFetcher<typeof followAction>();

  const label = isFollowing ? 'Unfollow' : 'Follow';

  const icon = isFollowing ? <UserMinus /> : <UserAdd />;

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
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );

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
