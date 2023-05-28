import { useState } from 'react';

import { NotAllowedIcon } from '@chakra-ui/icons';
import { Button, MenuItem, useColorModeValue } from '@chakra-ui/react';

import { useTypedFetcher, useTypedRouteLoaderData } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/$id';
import type { action as blockAction } from '~/routes/api/user/block';

type BlockTypes = {
  block: boolean;
  blockId: string;
  header: boolean;
};

export const BlockUser = ({ block, blockId, header }: BlockTypes) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.900');
  const [isBlocked, setIsBlocked] = useState(block);
  const fetcher = useTypedFetcher<typeof blockAction>();
  const currentUserId = useSessionUser()?.userId ?? '';
  const userId = useTypedRouteLoaderData<typeof loader>('routes/$id')?.user.userId ?? '';

  const handleClick = () => {
    setIsBlocked(!isBlocked);
    fetcher.submit(
      { blockId, currentUserId, isNotBlocked: String(!isBlocked), userId },
      { action: '/api/user/block', method: 'post', replace: true },
    );
  };

  return header ? (
    <Button onClick={handleClick} borderRadius="2xl" w="100px" variant="outline" color="red">
      blocked
    </Button>
  ) : (
    <MenuItem
      icon={<NotAllowedIcon boxSize="18px" />}
      bg={bg}
      color={color}
      _hover={isBlocked ? { color: 'green.300' } : { color: 'red' }}
      onClick={handleClick}
    >
      {isBlocked ? 'unblock' : 'block'}
    </MenuItem>
  );
};
