import { type Dispatch, type SetStateAction, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import { AnimatePresence, motion, wrap } from 'framer-motion';

import { useExpandedTileIndex, useExpandedTiles } from '~/hooks/useExpandedTileState';

import AnalyzeTrack from './actions/AnalyzeTrack';
import CopyLink from './actions/CopyLink';
import PlayPreview from './actions/PlayPreview';
import QueueToSelf from './actions/QueueToSelf';
import Recommend from './actions/Recommend';
import SaveToLiked from './actions/SaveToLiked';
import SendList from './actions/sendlist/SendList';
import ToggleQueueList from './ToggleQueueList';

const ExpandedActions = ({
  page,
  playing,
  setPlaying,
}: {
  page: number;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) => {
  const [showList, setShowList] = useState(false);
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
        {!showList ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Stack>
              <SaveToLiked trackId={tracks[index].id} />
              <Recommend />
              <QueueToSelf
                withIcon
                trackId={tracks[index].id}
                variant="ghost"
                fontSize="14px"
                w={['100vw', '100%']}
                color="musy.200"
                _hover={{ color: 'white' }}
              />
              <ToggleQueueList setShow={setShowList} />

              <AnalyzeTrack trackId={tracks[index].id} />
              {tracks[index].link !== '' && <CopyLink link={tracks[index].link} />}
              <PlayPreview
                playing={playing}
                setPlaying={setPlaying}
                preview_url={tracks[index].preview_url}
              />
              {/* <ProfileSong /> */}
            </Stack>
          </motion.div>
        ) : (
          <SendList trackId={tracks[index].id} setShow={setShowList} />
        )}
      </Stack>
    </AnimatePresence>
  );
};

export default ExpandedActions;
