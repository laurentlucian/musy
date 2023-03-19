import { NotAllowedIcon } from '@chakra-ui/icons';
import { MenuItem, useColorModeValue } from '@chakra-ui/react';
import { useSubmit } from '@remix-run/react';
import React, { useState } from 'react';

type BlockTypes = {
  block: boolean;
  blockId: string;
};

export const BlockUser = ({ block, blockId }: BlockTypes) => {
  const [isBlocked, setIsBlocked] = useState(block);
  const submit = useSubmit();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  const handleClick = () => {
    setIsBlocked(!isBlocked);
    submit({ blockId: blockId, blockUser: String(!isBlocked) }, { method: 'post', replace: true });
  };
  return (
    <>
      <MenuItem
        icon={<NotAllowedIcon boxSize="18px" />}
        bg={bg}
        color={color}
        _hover={isBlocked ? { color: 'green.300' } : { color: 'red' }}
        onClick={handleClick}
      >
        {isBlocked ? 'unblock user' : 'block user'}
      </MenuItem>
    </>
  );
};
