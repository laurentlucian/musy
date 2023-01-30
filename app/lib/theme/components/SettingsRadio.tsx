import { Box, useColorModeValue, useRadio } from '@chakra-ui/react';

export const RadioButtons = (props: any) => {
  const bg = useColorModeValue('white', 'music.800');
  const color = useColorModeValue('music.800', 'white');

  const { getCheckboxProps, getInputProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" p={0} m={0}>
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth={[0, '1px']}
        w={['101vw', 'unset']}
        borderRadius={[0, 'md']}
        boxShadow="sm"
        fontSize={'16px'}
        color={color}
        bg={bg}
        _hover={{
          textDecor: 'none',
        }}
        px={5}
        mx={['-20px', 'unset']}
        py={2}
        opacity={1}
        _checked={{
          bg,
          color,
          opacity: 0.9,
          textDecor: 'none',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
