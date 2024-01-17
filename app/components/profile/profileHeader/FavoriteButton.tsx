import { useParams } from '@remix-run/react';

import { Star1 } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useCurrentUser from '~/hooks/useCurrentUser';
import type { action as favoriteAction } from '~/routes/api+/user+/favorite';

const FavoriteButton = (props: { id?: string }) => {
  const currentUser = useCurrentUser();
  const params = useParams();
  const userId = (props.id || params.id) ?? '';
  const fetcher = useTypedFetcher<typeof favoriteAction>();

  const isOwnProfile = currentUser?.userId === userId;
  if (isOwnProfile) return null;

  const isFavorited = currentUser?.favorite.find((fav) => fav.favoriteId === userId);

  const label = currentUser ? (isFavorited ? 'unfavorite' : 'favorite') : 'sign in to favorite';

  return null;
};

export default FavoriteButton;
