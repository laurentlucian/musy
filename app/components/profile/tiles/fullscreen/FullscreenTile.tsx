import { useState } from 'react';

import { SimpleGrid } from '@chakra-ui/react';

import FullscreenTileInfo from './FullscreenTileInfo';
import CloseButton from './menu/CloseButton';
import FullscreenTileActions from './menu/FullscreenTileActions';
import Wrapper from './Wrapper';

const FullscreenTile = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [playing, setPlaying] = useState(false);

  return (
    <Wrapper>
      <SimpleGrid columns={[1, 2]} overflow="hidden">
        <FullscreenTileInfo page={page} direction={direction} setPage={setPage} />
        <FullscreenTileActions page={page} playing={playing} setPlaying={setPlaying} />
      </SimpleGrid>
      <CloseButton setPlaying={setPlaying} setPage={setPage} />
    </Wrapper>
  );
};

export default FullscreenTile;
