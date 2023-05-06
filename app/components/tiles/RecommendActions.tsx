import { BarChart, MoreHorizontal } from 'react-feather';

import { Menu, MenuButton, MenuList, MenuItem, useColorModeValue, Button } from '@chakra-ui/react';

import { Archive } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import type { action } from '~/routes/api/removeRecommend';

const RecommendActions = ({ onToggle, trackId }: { onToggle: () => void; trackId: string }) => {
  const fetcher = useTypedFetcher<typeof action>();

  const archiveRecommend = () => {
    fetcher.submit({ trackId }, { action: '/api/removeRecommend', method: 'post', replace: true });
  };

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');

  const Desktop = (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        aria-label="open options"
        rightIcon={<MoreHorizontal />}
        _hover={{ color: 'spotify.green' }}
        _active={{ bg: '#0000' }}
        h="10px"
        alignSelf="center"
        bg="#0000"
        color={color}
      />
      <MenuList bg={bg}>
        <MenuItem icon={<BarChart />} onClick={onToggle} bg="#0000" color={color}>
          rate
        </MenuItem>
        <MenuItem icon={<Archive />} onClick={archiveRecommend} bg="#0000" color={color}>
          archive
        </MenuItem>
      </MenuList>
    </Menu>
  );
  return Desktop;
};

export default RecommendActions;
