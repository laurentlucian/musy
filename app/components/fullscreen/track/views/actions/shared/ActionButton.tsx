import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';

type ActionButtonProps = {} & ButtonProps;

const ActionButton = (props: ActionButtonProps) => {
  return (
    <Button
      variant="ghost"
      justifyContent="left"
      w={['100vw', '100%']}
      color="musy.200"
      _hover={{ color: 'white' }}
      py={['30px', '20px']}
      iconSpacing="15px"
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default ActionButton;
