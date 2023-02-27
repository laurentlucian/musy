import { useState } from 'react';

import { Stack } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import type { Track } from '~/lib/types/types';

import AddQueue from '../menu/actions/AddQueue';
import AnalyzeTrack from '../menu/actions/AnalyzeTrack';
import CopyLink from '../menu/actions/CopyLink';
import PlayPreview from '../menu/actions/PlayPreview';
import ProfileSong from '../menu/actions/ProfileSong';
import SaveToLiked from '../menu/actions/SaveToLiked';
import RecommendTo from './actions/RecommendTo';
import SendList from './actions/SendList';
import SendTo from './actions/SendTo';

const TileActions = ({ track }: { track: Track }) => {
  const [show, setShow] = useState(0);

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
              <SaveToLiked trackId={track.id} />
              <AnalyzeTrack trackId={track.id} />
              {track.link !== '' && <CopyLink link={track.link} />}
              <PlayPreview preview_url={track.preview_url} />
              <ProfileSong />
              <AddQueue trackId={track.id} user={null} />
              <SendTo setShow={setShow} />
              <RecommendTo setShow={setShow} />
            </Stack>
          </motion.div>
        ) : (
          <SendList trackId={track.id} setShow={setShow} show={show} />
        )}
      </Stack>
    </AnimatePresence>
  );
};

export default TileActions;
