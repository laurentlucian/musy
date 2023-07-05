import { Link } from '@remix-run/react';

import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react';

import type { Playlist } from '@prisma/client';

const ActivityPlaylistInfo = ({ playlist }: { playlist: Playlist }) => {
  return (
    <HStack>
      <Box w="35px" h="35px">
        <Image src={playlist.image} />
      </Box>
      <Link to={`/${playlist.userId}/${playlist.id}`}>
        <Stack spacing={0} data-group>
          <Text fontWeight="bold" fontSize="xs" _groupHover={{ textDecoration: 'underline' }}>
            {playlist.name}
          </Text>
          <Text fontSize="9px">{playlist.description}</Text>
        </Stack>
      </Link>
    </HStack>
  );
};

export default ActivityPlaylistInfo;
