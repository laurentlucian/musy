import { IconButton } from '@chakra-ui/react';
import { useSubmit } from '@remix-run/react';
import { Add, Minus } from 'iconsax-react';
import { useState } from 'react';
import Tooltip from '../Tooltip';

type FollowingType = {
  following: boolean;
};

const Following = ({ following }: FollowingType) => {
  const [isFollowing, setFollowing] = useState(following);
  const submit = useSubmit();

  const handleClick = () => {
    setFollowing(!isFollowing);
    submit({ follow: String(!isFollowing) }, { method: 'post', replace: true });
  };

  return (
    <Tooltip label={isFollowing ? 'unfollow' : 'follow'}>
      <IconButton
        aria-label={isFollowing ? 'unfollow' : 'follow'}
        icon={isFollowing ? <Minus /> : <Add />}
        variant="ghost"
        cursor="pointer"
        onClick={handleClick}
        color="music.400"
      />
    </Tooltip>
  );
};

export default Following;
