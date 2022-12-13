import { HStack, Image, Stack, Text, Link as LinkB, Spacer } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import Tooltip from './Tooltip';
import { timeSince } from '~/hooks/utils';
import type { Profile } from '@prisma/client';

type TileProps = {
  uri: string;
  image: string;
  albumUri: string | null;
  name: string;
  artist: string;
  artistUri: string | null;
  explicit: boolean;

  // name, not Id
  sendTo?: string;

  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
};

const ActivitiyFeed = ({
  uri,
  image,
  name,
  createdAt,
  createdBy,
  artist,
  albumUri,
  artistUri,
}: TileProps) => {
  return (
    <Stack pr={'6.9px'}>
      <HStack>
        <Tooltip label={createdBy?.name} placement="top-start">
          <Link to={`/${createdBy?.userId}`}>
            <Image w="40px" borderRadius="100%" src={createdBy?.image} />
          </Link>
        </Tooltip>

        <Image w="15px" src="heart.svg" />
        <Text fontSize={{ base: '8px', md: '10px' }} opacity={0.6} w="100%">
          {timeSince(createdAt ?? null)}
        </Text>
      </HStack>
      <HStack borderRadius={5} bgColor="hsl(345deg 0% 31%/ 0.15)" w={'100%'} pl={2}>
        <Stack spacing={0} px={2} w="200px">
          <Tooltip label={name} placement="top-start">
            <LinkB href={uri}>
              <Text fontSize="12px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
            </LinkB>
          </Tooltip>
          <LinkB href={artistUri}>
            <Tooltip label={artist} placement="top-start">
              <Text fontSize="8px" opacity={0.6}>
                {artist}
              </Text>
            </Tooltip>
          </LinkB>
        </Stack>
        <HStack w="55%" justify="end">
          <LinkB href={albumUri} target="_blank">
            <Tooltip label={name} placement="top-start">
              <Image w="100%" src={image} />
            </Tooltip>
          </LinkB>
        </HStack>
        {/* <Divider orientation="vertical" bgColor="red" h={'30px'} /> */}
      </HStack>
    </Stack>
  );
};

export default ActivitiyFeed;
