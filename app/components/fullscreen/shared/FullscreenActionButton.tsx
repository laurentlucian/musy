import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';

const FullscreenActionButton = (props: ButtonProps) => {
  return (
    <Button
      variant="ghost"
      justifyContent="left"
      w={['100vw', '100%']}
      color="musy.200"
      _hover={{ color: 'white' }}
      py="30px"
      iconSpacing="15px"
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default FullscreenActionButton;
