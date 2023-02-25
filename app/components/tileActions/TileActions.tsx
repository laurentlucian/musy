import { Stack } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import type { Track } from '~/lib/types/types';

import AddQueue from '../menu/actions/AddQueue';
import AnalyzeTrack from '../menu/actions/AnalyzeTrack';
import CopyLink from '../menu/actions/CopyLink';
import PlayPreview from '../menu/actions/PlayPreview';
import ProfileSong from '../menu/actions/ProfileSong';
import SaveToLiked from '../menu/actions/SaveToLiked';
import RecommendTo from './actions/RecommendTo';
import SendTo from './actions/SendTo';

const TileActions = ({ track }: { track: Track }) => {
  return (
    <Stack alignSelf={['unset', 'center']} pl={[0, '75px']}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Stack>
          <SaveToLiked trackId={track.id} />
          <AnalyzeTrack trackId={track.id} />
          {track.link !== '' && <CopyLink link={track.link} />}
          <PlayPreview preview_url={track.preview_url} />
          <ProfileSong />
          <AddQueue trackId={track.id} user={null} />
          <SendTo />
          <RecommendTo />
        </Stack>
      </motion.div>
    </Stack>
  );
};

export default TileActions;