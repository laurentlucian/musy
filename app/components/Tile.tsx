import type { ChakraProps } from '@chakra-ui/react';
import {
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  Link as LinkB,
  Menu,
  MenuButton,
  IconButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useParams } from '@remix-run/react';
import { forwardRef } from 'react';
import { ElementPlus } from 'iconsax-react';
import explicitImage from '~/assets/explicit-solid.svg';
import { timeSince } from '~/hooks/utils';
import AddQueue from './AddQueue';
import Tooltip from './Tooltip';

type TileProps = {
  uri: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;

  // name, not Id
  sendTo?: string;

  user: Profile | null;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
  playlist?: Boolean;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      uri,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      sendTo,
      user,
      createdAt,
      createdBy,
      playlist,
      ...props
    },
    ref,
  ) => {
    const { id } = useParams();

    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };

    return (
      <Stack ref={ref} flex="0 0 200px" {...props}>
        <Flex direction="column">
          {createdAt && (
            <HStack align="center" h="35px">
              {createdBy ? (
                <Link to={`/${createdBy.userId}`}>
                  <HStack align="center">
                    <Image borderRadius={50} boxSize="25px" mb={1} src={createdBy.image} />
                    <Text fontWeight="semibold" fontSize="13px">
                      {createdBy.name.split(' ')[0]}
                    </Text>
                  </HStack>
                </Link>
              ) : (
                <Text fontWeight="semibold" fontSize="13px">
                  Anon
                </Text>
              )}
              <Text as="span">·</Text>
              <Text fontSize="12px" opacity={0.6}>
                {timeSince(createdAt ?? null)}
              </Text>
            </HStack>
          )}

          {albumUri ? (
            <LinkB href={albumUri} target="_blank">
              <Tooltip label={albumName} placement="top-start">
                <Image
                  boxSize="200px"
                  objectFit="cover"
                  src={image}
                  borderRadius={5}
                  draggable={false}
                />
              </Tooltip>
            </LinkB>
          ) : (
            <Tooltip label={albumName} placement="top-start">
              <Image
                boxSize="200px"
                objectFit="cover"
                src={image}
                borderRadius={5}
                draggable={false}
              />
            </Tooltip>
          )}
        </Flex>
        <Flex justify="space-between">
          <Stack spacing={0}>
            <LinkB href={uri} target="_blank">
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
            </LinkB>
            {artist && (
              <Flex align="center">
                {explicit && <Image src={explicitImage} mr={1} w="19px" />}
                {artistUri ? (
                  <LinkB href={artistUri} target="_blank">
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {artist}
                    </Text>
                  </LinkB>
                ) : (
                  <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                    {decodeHtmlEntity(artist)}
                  </Text>
                )}
              </Flex>
            )}
          </Stack>
          {!playlist && (
            <Flex minW="35px" justify="center">
              <Menu
                direction="ltr"
                placement="bottom-end"
                colorScheme={'menuTheme'}
                closeOnSelect={false}
              >
                <MenuButton
                  as={IconButton}
                  variant="ghost"
                  aria-label="options"
                  icon={<ElementPlus />}
                  boxShadow="none"
                  _active={{ boxShadow: 'none', opacity: 1 }}
                  _hover={{ boxShadow: 'none', opacity: 1, color: 'spotify.green' }}
                  opacity={0.5}
                />
                <MenuList>
                  <MenuItem closeOnSelect={false} w="100%">
                    <AddQueue
                      key={id}
                      uri={uri}
                      image={image}
                      albumName={albumName}
                      albumUri={albumUri}
                      name={name}
                      artist={artist}
                      artistUri={artistUri}
                      explicit={explicit ?? false}
                      userId={user?.userId}
                      sendTo={sendTo}
                    />
                  </MenuItem>
                  <MenuItem>hi</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          )}
        </Flex>
      </Stack>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
