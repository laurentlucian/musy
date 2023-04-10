import { Link as RemixLink } from '@remix-run/react';

import { Link, Stack } from '@chakra-ui/react';

const Filters = () => {
  return (
    <Stack direction="row" pt="50px">
      <Link as={RemixLink} to="/explore/users">
        Users
      </Link>
      <Link as={RemixLink} to="/explore">
        Tracks
      </Link>
    </Stack>
  );
};

export default Filters;
