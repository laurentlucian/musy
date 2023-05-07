import { type Dispatch, type SetStateAction, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import { AnimatePresence, motion, wrap } from 'framer-motion';

import { useExpandedTileIndex, useExpandedTiles } from '~/hooks/useExpandedTileState';

import AnalyzeTrack from './actions/AnalyzeTrack';
import CopyLink from './actions/CopyLink';
import PlayPreview from './actions/PlayPreview';
import ProfileSong from './actions/ProfileSong';
import QueueToSelf from './actions/QueueToSelf';
import SaveToLiked from './actions/SaveToLiked';
import SendList from './SendList';
import ToggleQueueList from './ToggleQueueList';
import ToggleRecommendList from './ToggleRecommendList';

const ExpandedActions = ({
  page,
  playing,
  setPlaying,
}: {
  page: number;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const [show, setShow] = useState(0);
  const tracks = useExpandedTiles();
  const originalIndex = useExpandedTileIndex();
  const index = wrap(0, tracks.length, page + originalIndex);

  return (
    <AnimatePresence>
      <Stack
        alignSelf={['unset', 'center']}
        px={['12px', '75px']}
        py={['15px']}
        w="100%"
        overflowX="hidden"
      >
        {show === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Stack>
              <SaveToLiked trackId={tracks[index].id} />
              <AnalyzeTrack trackId={tracks[index].id} />
              {tracks[index].link !== '' && <CopyLink link={tracks[index].link} />}
              <PlayPreview
                playing={playing}
                setPlaying={setPlaying}
                preview_url={tracks[index].preview_url}
              />
              <ProfileSong />
              <QueueToSelf trackId={tracks[index].id} />
              <ToggleQueueList setShow={setShow} />
              <ToggleRecommendList setShow={setShow} />
            </Stack>
          </motion.div>
        ) : (
          <SendList trackId={tracks[index].id} setShow={setShow} show={show} />
        )}
      </Stack>
    </AnimatePresence>
  );
};

export default ExpandedActions;
