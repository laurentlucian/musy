import { useFetcher, useParams } from '@remix-run/react';

import { IconButton } from '@chakra-ui/react';

import { Star1 } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';

const FavoriteButton = (props: { id?: string }) => {
  const currentUser = useSessionUser();
  const params = useParams();
  const id = (props.id || params.id) as string;
  const fetcher = useFetcher();

  const isOwnProfile = currentUser?.userId === id;
  if (isOwnProfile) return null;

  const isFavorited = currentUser?.favorite.find((fav) => fav.favoriteId === id);

  return (
    <Tooltip label={isFavorited ? 'unfavorite' : 'favorite'}>
      <IconButton
        aria-label={isFavorited ? 'unfavorite' : 'favorite'}
        icon={isFavorited ? <Star1 variant="Bold" /> : <Star1 />}
        isLoading={fetcher.formAction?.includes(id)}
        variant="ghost"
        cursor="pointer"
        onClick={(e) => {
          e.preventDefault();
          fetcher.submit(
            { isFavorited: isFavorited ? 'false' : 'true' },
            { action: `/${id}`, method: 'post', replace: true },
          );
        }}
        color={isFavorited ? 'gold' : 'white'}
      />
    </Tooltip>
  );
};

export default FavoriteButton;
