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

import type { Profile, Recommended as RecommendedSongs, Track } from '@prisma/client';

import useSessionUser from '~/hooks/useSessionUser';
import type { TrackWithUsers } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import Tile from '../tile/Tile';
import TileImage from '../tile/TileImage';
import TileInfo from '../tile/TileInfo';
import Tiles from '../Tiles';

const Recommended = (props: {
  recommended: (RecommendedSongs & {
    track: TrackWithUsers;
  })[];
}) => {
  const scrollButtons = props.recommended.length > 5;

  const tracks = props.recommended.map(({ track }) => track);

  if (props.recommended.length === 0) return null;

  return (
    <>
      <Stack spacing={3}>
        <Tiles title="Recommended" scrollButtons={scrollButtons}>
          {props.recommended.map((recommended, index) => {
            const layoutKey = 'Recommended' + index;
            return (
              <Stack key={recommended.id} direction="row">
                <Stack>
                  <Tile
                    key={recommended.id}
                    track={recommended.track}
                    tracks={tracks}
                    index={index}
                    layoutKey={layoutKey}
                    image={<TileImage />}
                    info={<TileInfo />}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Tiles>
      </Stack>
    </>
  );
};

export default Recommended;
