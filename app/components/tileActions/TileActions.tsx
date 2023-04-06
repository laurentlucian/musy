import { type Dispatch, type SetStateAction, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import { AnimatePresence, motion, wrap } from 'framer-motion';

import { useDrawerTrackIndex, useDrawerTracks } from '~/hooks/useDrawer';

import AddQueue from '../menu/actions/AddQueue';
import AnalyzeTrack from '../menu/actions/AnalyzeTrack';
import CopyLink from '../menu/actions/CopyLink';
import PlayPreview from '../menu/actions/PlayPreview';
import ProfileSong from '../menu/actions/ProfileSong';
import SaveToLiked from '../menu/actions/SaveToLiked';
import RecommendTo from './actions/RecommendTo';
import SendList from './actions/SendList';
import SendTo from './actions/SendTo';

const TileActions = ({
  page,
  playing,
  setPlaying,
}: {
  page: number;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const [show, setShow] = useState(0);
  const tracks = useDrawerTracks();
  const originalIndex = useDrawerTrackIndex();
  const index = wrap(0, tracks.length, page + originalIndex);

  return (
    <AnimatePresence>
      <Stack
        alignSelf={['unset', 'center']}
        justifyContent="center"
        px={['12px', '75px']}
        w="100%"
        h="100%"
        overflowX="hidden"
      >
        {show === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Stack w="250px">
              <SaveToLiked trackId={tracks[index].id} />
              <AnalyzeTrack trackId={tracks[index].id} />
              {tracks[index].link !== '' && <CopyLink link={tracks[index].link} />}
              <PlayPreview
                playing={playing}
                setPlaying={setPlaying}
                preview_url={tracks[index].preview_url}
              />
              <ProfileSong />
              <AddQueue trackId={tracks[index].id} user={null} />
              <SendTo setShow={setShow} />
              <RecommendTo setShow={setShow} />
            </Stack>
          </motion.div>
        ) : (
          <SendList trackId={tracks[index].id} setShow={setShow} show={show} />
        )}
      </Stack>
    </AnimatePresence>
  );
};

export default TileActions;
