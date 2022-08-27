import { Button, Flex, Input } from "@chakra-ui/react";
import type { Profile as ProfileType } from "@prisma/client";
import { Form, useSubmit } from "@remix-run/react";

type FollowingType = {
  user: ProfileType;
  following: SpotifyApi.UserFollowsUsersOrArtistsResponse;
  currentUser: ProfileType;
};

const Following = ({ currentUser, user, following }): FollowingType => {
  const submit = useSubmit();

  const text = following[0] ? "Unfollow" : "Follow";

  currentUser.userId !== user.id && (
    <Flex mt={1} ml={-2}>
      <Form method="post">
        <Input type="hidden" name={text} />
        <Button ml={"10px"} borderRadius={"md"} onClick={(e) => submit(e.currentTarget.form)}>
          {text}
        </Button>
      </Form>
    </Flex>
  );
};

export default Following;
