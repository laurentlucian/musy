import { useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Button, Divider, Heading, HStack, Stack, useColorModeValue } from '@chakra-ui/react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSave';

const SettingsHeader = () => {
  const [show, setShow] = useState(0);
  const navigate = useNavigate();
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#161616', '#EEE6E2');
  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const handleClick = () => {
    if (disable) {
      showAlert();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY - 50);
    };
    window.addEventListener('scroll', checkScroll);

    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <Stack w="100%" h="100%" bg={bg}>
      <HStack w="100%" bg={bg} justifyContent="center">
        <Heading fontSize="13px" mt="15px" ml="20px">
          Settings
        </Heading>
        <Button onClick={handleClick} pos="fixed" top={2} right={0} bg={bg} color={color}>
          Done
        </Button>
      </HStack>
      <Divider bg={show + 50 <= 45 ? bg : color} />
    </Stack>
  );
};

export default SettingsHeader;
