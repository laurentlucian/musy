import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import { NotAllowedIcon } from '@chakra-ui/icons';
import { Button, MenuItem, useColorModeValue } from '@chakra-ui/react';

type BlockTypes = {
  block: boolean;
  blockId: string;
  header: boolean;
};

export const BlockUser = ({ block, blockId, header }: BlockTypes) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');
  const [isBlocked, setIsBlocked] = useState(block);
  const submit = useSubmit();

  const handleClick = () => {
    setIsBlocked(!isBlocked);
    submit({ blockId: blockId, blockUser: String(!isBlocked) }, { method: 'post', replace: true });
  };
  return (
    <>
      {header ? (
        <>
          <Button onClick={handleClick} borderRadius="2xl" w="100px" variant="outline" color="red">
            blocked
          </Button>
        </>
      ) : (
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
      )}
    </>
  );
};
