import { Stack } from '@chakra-ui/react';

import ActivityTrackInfo from '~/components/activity/shared/ActivityTrackInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import useIsMobile from '~/hooks/useIsMobile';

import TrackInfo from '../shared/FullscreenTrackInfo';
import { useFullscreenTrack } from './FullscreenTrack';

const variants = {
  center: {
    opacity: 1,
    x: 0,
    zIndex: 1,
  },
  enter: (direction: number) => {
    return {
      opacity: 0,
      x: direction > 0 ? 1000 : -1000,
    };
  },
  exit: (direction: number) => {
    return {
      opacity: 0,
      x: direction < 0 ? 1000 : -1000,
      zIndex: 0,
    };
  },
};

const FullscreenTrackHeader = () => {
  const { track } = useFullscreenTrack();
  const isSmallScreen = useIsMobile();
  // const [dragging, setDragging] = useState(false);

  // useEventListener('keydown', (e) => {
  //   if (e.code === 'ArrowRight') paginate(1);
  //   if (e.code === 'ArrowLeft') paginate(-1);
  // });

  return (
    // <motion.div
    //   key={page}
    //   custom={direction}
    //   variants={variants}
    //   initial={dragging ? 'enter' : false}
    //   animate="center"
    //   exit={dragging ? 'exit' : 'unset'}
    //   transition={{
    //     opacity: { duration: 0.2 },
    //     x: { damping: 30, stiffness: 300, type: 'spring' },
    //   }}
    //   style={{ touchAction: 'none' }}
    //   drag={tracks.length > 1 ? 'x' : false}
    //   dragConstraints={{ left: 0, right: 0 }}
    //   dragElastic={1}
    //   onDragEnd={(e, { offset, velocity }) => {
    //     const swipe = swipePower(offset.x, velocity.x);
    //     if (swipe < -10000) {
    //       paginate(1);
    //     } else if (swipe > 10000) {
    //       paginate(-1);
    //     }
    //   }}
    //   onPanEnd={() => {
    //     setDragging(false);
    //   }}
    // >
    <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
      <Stack direction="column" w="65%">
        <TileTrackImage image={{ src: track.image }} />
        <ActivityTrackInfo track={track} w="100%" />
      </Stack>
      <TrackInfo track={track} />
    </Stack>
    // </motion.div>
  );
};

export default FullscreenTrackHeader;
