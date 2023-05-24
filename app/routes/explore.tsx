import { Outlet, useLocation } from '@remix-run/react';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import Tile from '~/components/profile/tiles/tile/Tile';
import TileImage from '~/components/profile/tiles/tile/TileImage';
import TileInfo from '~/components/profile/tiles/tile/TileInfo';
import { useExplore } from '~/hooks/useExplore';

const Explore = () => {
  const { tracks } = useExplore();
  const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack bg={bg} alignItems="center" px="5px" overflow="hidden">
      <Stack w={['100%', '500px']}>
        {tracks?.map((track, index) => {
          const layoutKey = 'Explore' + index;
          return (
            !pathname.includes('/users') && (
              <Tile
                key={track.id}
                track={track}
                tracks={tracks}
                index={index}
                layoutKey={layoutKey}
                image={<TileImage size={'40px'} />}
                info={<TileInfo />}
                list
              />
            )
          );
        })}

        <Outlet />
      </Stack>
    </Stack>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';

export default Explore;
