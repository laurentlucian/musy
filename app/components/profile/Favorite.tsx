import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import { IconButton } from '@chakra-ui/react';

import { Star1 } from 'iconsax-react';

import Tooltip from '../Tooltip';

type FavoriteType = {
  favId: string;
  favorite: boolean;
};

const Favorite = ({ favId, favorite }: FavoriteType) => {
  const [isFavorite, setFavorite] = useState(favorite);
  const submit = useSubmit();

  const handleClick = () => {
    setFavorite(!isFavorite);
    submit({ favId, favUser: String(!isFavorite) }, { method: 'post', replace: true });
  };

  return (
    <Tooltip label={isFavorite ? 'unfavorite' : 'favorite'}>
      <IconButton
        aria-label={isFavorite ? 'unfavorite' : 'favorite'}
        icon={isFavorite ? <Star1 variant="Bold" /> : <Star1 />}
        variant="ghost"
        cursor="pointer"
        onClick={handleClick}
        color={isFavorite ? 'gold' : 'white'}
      />
    </Tooltip>
  );
};

export default Favorite;
