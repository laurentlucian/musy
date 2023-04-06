import { useState } from 'react';

import { SimpleGrid } from '@chakra-ui/react';

import { AnimatePresence } from 'framer-motion';

import CloseButton from './actions/CloseButton';
import { default as Track } from './ActionTrack';
import { default as Actions } from './TileActions';
import Wrapper from './Wrapper';

const ExpandedTile = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [playing, setPlaying] = useState(false);

  return (
    <AnimatePresence initial={false} custom={direction}>
      <Wrapper>
        <SimpleGrid columns={[1, 2]} justifyItems="end" w="100%" h="100%" overflow="hidden">
          <Track page={page} direction={direction} setPage={setPage} />
          <Actions page={page} playing={playing} setPlaying={setPlaying} />
        </SimpleGrid>
        <CloseButton setPlaying={setPlaying} setPage={setPage} />
      </Wrapper>
    </AnimatePresence>
  );
};

export default ExpandedTile;
