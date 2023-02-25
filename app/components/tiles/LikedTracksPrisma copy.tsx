import { useParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import type { LikedSongs } from '@prisma/client';
import type { Track } from '@prisma/client';

import { useDrawerTrack } from '~/hooks/useDrawer';

import { MotionTile } from '../MotionTile';
import Tiles from './Tiles';

const LikedTracksPrismaTest = ({
  liked: initialLiked,
}: {
  liked: (LikedSongs & {
    track: Track & {};
  })[];
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const { id } = useParams();

  // eslint-disable-next-line
  const track = useDrawerTrack();

  const tileRef = useRef(null);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  if (!liked) return null;
  const scrollButtons = liked.length > 5;
  const title = 'motion test';

  if (!liked.length) return null;
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons}>
        {liked.map(({ track }) => {
          return (
            <MotionTile
              key={track.id}
              layoutKey="LikedTest"
              ref={tileRef}
              track={track}
              profileId={id ?? ''}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default LikedTracksPrismaTest;
