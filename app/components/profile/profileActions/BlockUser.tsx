import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import { NotAllowedIcon } from '@chakra-ui/icons';
import { MenuItem } from '@chakra-ui/react';

type BlockTypes = {
  bg: string;
  block: boolean;
  blockId: string;
  color: string;
};

export const BlockUser = ({ bg, block, blockId, color }: BlockTypes) => {
  const [isBlocked, setIsBlocked] = useState(block);
  const submit = useSubmit();

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
