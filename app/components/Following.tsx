import { Flex, IconButton, Input } from '@chakra-ui/react';
import type { Profile as ProfileType } from '@prisma/client';
import { Form, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { Add, Minus } from 'iconsax-react';
import Tooltip from './Tooltip';

type FollowingType = {
  user: ProfileType;
  following: boolean;
  currentUser: ProfileType;
};

const Following = ({ currentUser, user, following }: FollowingType) => {
  const [isFollowing, setFollowing] = useState(following);
  const submit = useSubmit();

  const value = isFollowing ? 'Unfollow' : 'Follow';

  return (
    <>
      {currentUser.userId !== user.userId && (
        <Flex as={Form} ml="auto" method="post">
          <Input type="hidden" name={value} />
          {/* <Button
            borderRadius="md"
            onClick={(e) => {
              setFollowing(!isFollowing);
              submit(e.currentTarget.form);
            }}
          >
            {value}
          </Button> */}
          <Tooltip label={isFollowing ? 'Unfollow' : 'Follow'}>
            <IconButton
              aria-label={isFollowing ? 'unfollow' : 'follow'}
              name={isFollowing ? 'unfollow' : 'follow'}
              icon={isFollowing ? <Minus /> : <Add />}
              variant="ghost"
              cursor="pointer"
              type="submit"
              onClick={(e) => {
                setFollowing(!isFollowing);
                submit(e.currentTarget.form);
              }}
            />
          </Tooltip>
        </Flex>
      )}
    </>
  );
};

export default Following;
