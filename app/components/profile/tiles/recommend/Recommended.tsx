import { Link, useParams } from '@remix-run/react';

import {
  Image,
  Stack,
  Text,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useColorModeValue,
} from '@chakra-ui/react';

import type { Profile, RecommendedSongs, Track } from '@prisma/client';

import useSessionUser from '~/hooks/useSessionUser';
import { timeSince } from '~/lib/utils';

import Tile from '../tile/Tile';
import TileImage from '../tile/TileImage';
import TileInfo from '../tile/TileInfo';
import Tiles from '../Tiles';
import RecommendActions from './RecommendActions';
import RecommendRatingForm from './RecommendRatingForm';

const Recommended = (props: {
  recommended: (RecommendedSongs & {
    sender: Profile;
    track: Track;
  })[];
}) => {
  const currentUser = useSessionUser();
  const { id } = useParams();
  const isOwnProfile = currentUser?.userId === id;
  const scrollButtons = props.recommended.length > 5;
  const show = props.recommended.length > 0;

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');
  const { isOpen, onClose, onToggle } = useDisclosure();

  const tracks = props.recommended.map(({ track }) => track);

  if (isOwnProfile) return null;
  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {props.recommended.map((recommended, index) => {
              const layoutKey = 'Recommend' + index;
              return (
                <Stack key={recommended.id} direction="row">
                  <Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row" align="center">
                        <Link to={`/${recommended.senderId}`}>
                          <Image
                            borderRadius="full"
                            src={recommended.sender.image}
                            boxSize="40px"
                            mr="5px"
                          />
                        </Link>
                        <Link to={`/${recommended.senderId}`}>
                          <Text fontSize="13px">{recommended.sender.name}</Text>
                        </Link>
                        <Text fontSize={['9px', '10px']} opacity={0.6}>
                          {timeSince(recommended.createdAt)}
                        </Text>
                      </Stack>
                      <RecommendActions trackId={recommended.trackId} onToggle={onToggle} />
                    </Stack>
                    <Popover
                      returnFocusOnClose={false}
                      isOpen={isOpen}
                      onClose={onClose}
                      placement="bottom"
                    >
                      <PopoverTrigger>
                        <>
                          <Tile
                            key={recommended.id}
                            track={recommended.track}
                            tracks={tracks}
                            index={index}
                            layoutKey={layoutKey}
                            image={<TileImage />}
                            info={<TileInfo />}
                          />
                        </>
                      </PopoverTrigger>
                      <PopoverContent bg={bg} color={color}>
                        <PopoverBody>
                          <PopoverArrow bg={bg} />
                          <RecommendRatingForm sender={recommended.sender.name} />
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Stack>
                </Stack>
              );
            })}
          </Tiles>
        </Stack>
      )}
    </>
  );
};

export default Recommended;
