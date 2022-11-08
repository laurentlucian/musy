import { Button, Flex, Input } from '@chakra-ui/react';
import type { Profile as ProfileType } from '@prisma/client';
import { Form, useSubmit } from '@remix-run/react';
import { useState } from 'react';

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
        <Flex as={Form} method="post">
          <Input type="hidden" name={value} />
          <Button
            mr="260px"
            borderRadius="md"
            onClick={(e) => {
              setFollowing(!isFollowing);
              submit(e.currentTarget.form);
            }}
          >
            {value}
          </Button>
        </Flex>
      )}
    </>
  );
};

export default Following;
