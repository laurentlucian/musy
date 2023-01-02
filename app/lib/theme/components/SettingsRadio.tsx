import { Box, useColorModeValue, useRadio } from '@chakra-ui/react';

export const RadioButtons = (props: any) => {
  const color = useColorModeValue('white', 'music.800');
  const bg = useColorModeValue('music.800', 'white');

  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" p={0} m={0}>
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="sm"
        fontSize={'16px'}
        color={bg}
        bg={color}
        _hover={{
          textDecor: 'none',
        }}
        px={5}
        py={2}
        opacity={0.5}
        _checked={{
          textDecor: 'none',
          opacity: '1',
          bg,
          color,
          borderColor: bg,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
