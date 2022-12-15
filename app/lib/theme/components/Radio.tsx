import { Box, useColorModeValue, useRadio } from '@chakra-ui/react';

export const RadioCard = (props: any) => {
  const color = useColorModeValue('music.800', 'white');

  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" p={0} m={0}>
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        _checked={{
          textDecor: 'underline',
          opacity: '1',
        }}
        fontSize={'10px'}
        color={color}
        _hover={{
          textDecor: 'underline',
        }}
        p={0}
        m={0}
        opacity={0.5}
      >
        {props.children}
      </Box>
    </Box>
  );
};
