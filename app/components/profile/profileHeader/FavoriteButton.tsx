import { useParams } from '@remix-run/react';

import { IconButton } from '@chakra-ui/react';

import { Star1 } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { action as favoriteAction } from '~/routes/api/user/favorite';

const FavoriteButton = (props: { id?: string }) => {
  const currentUser = useSessionUser();
  const params = useParams();
  const userId = (props.id || params.id) ?? '';
  const fetcher = useTypedFetcher<typeof favoriteAction>();

  const isOwnProfile = currentUser?.userId === userId;
  if (isOwnProfile) return null;

  const isFavorited = currentUser?.favorite.find((fav) => fav.favoriteId === userId);

  const label = currentUser ? (isFavorited ? 'unfavorite' : 'favorite') : 'sign in to favorite';

  return (
    <Tooltip label={label}>
      <IconButton
        aria-label={isFavorited ? 'unfavorite' : 'favorite'}
        icon={isFavorited ? <Star1 variant="Bold" /> : <Star1 />}
        isLoading={fetcher.formAction?.includes(userId)}
        variant="ghost"
        cursor="pointer"
        disabled={!currentUser}
        onClick={(e) => {
          e.preventDefault();
          if (currentUser) {
            fetcher.submit(
              {
                currentUserId: currentUser.userId,
                isFavorited: isFavorited ? 'false' : 'true',
                userId,
              },
              { action: `/api/user/favorite`, method: 'post', replace: true },
            );
          }
        }}
        color={isFavorited ? 'gold' : 'white'}
      />
    </Tooltip>
  );
};

export default FavoriteButton;
