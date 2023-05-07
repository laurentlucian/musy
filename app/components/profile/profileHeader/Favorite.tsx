import { useParams, useSubmit } from '@remix-run/react';

import { IconButton } from '@chakra-ui/react';

import { Star1 } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';

const Favorite = () => {
  const currentUser = useSessionUser();
  const { id } = useParams();
  const submit = useSubmit();

  const isOwnProfile = currentUser?.userId === id;
  if (isOwnProfile) return null;

  const isFavorited = currentUser?.favBy.find((fav) => fav.favoriteId === id);
  const handleClick = () => {
    submit({ isFavorited: isFavorited ? 'false' : 'true' }, { method: 'post', replace: true });
  };

  return (
    <Tooltip label={isFavorited ? 'unfavorite' : 'favorite'}>
      <IconButton
        aria-label={isFavorited ? 'unfavorite' : 'favorite'}
        icon={isFavorited ? <Star1 variant="Bold" /> : <Star1 />}
        variant="ghost"
        cursor="pointer"
        onClick={handleClick}
        color={isFavorited ? 'gold' : 'white'}
      />
    </Tooltip>
  );
};

export default Favorite;
