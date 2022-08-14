import { Button, Flex, Input } from '@chakra-ui/react';
import type { Profile as ProfileType } from '@prisma/client';
import { Form, useSubmit } from '@remix-run/react';

type ButtonComponent = {
  user: ProfileType;
  following: SpotifyApi.UserFollowsUsersOrArtistsResponse;
  currentUser: ProfileType | null;
};

function Following({ currentUser, user, following }: ButtonComponent) {
  const submit = useSubmit();

  return (
    <>
      {!currentUser ? (
        <></>
      ) : user.userId !== currentUser.userId ? (
        <Flex mt={1} ml={-2}>
          <Form method="post">
            <Input type="hidden" name={following[0] === true ? 'Unfollow' : 'Follow'} />
            <Button ml={'10px'} borderRadius={'md'} onClick={(e) => submit(e.currentTarget.form)}>
              {following[0] === true ? 'Unfollow' : 'Follow'}
            </Button>
          </Form>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}

export default Following;
