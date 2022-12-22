import { useColorMode, Button, Stack } from '@chakra-ui/react';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const Appearance = () => {
  const { setColorMode } = useColorMode();
  return (
    <>
      <Stack direction="row">
        <Button aria-label="dark" onClick={() => setColorMode('dark')}>
          dark
        </Button>
        <Button aria-label="light" onClick={() => setColorMode('light')}>
          light
        </Button>
        <Button aria-label="system" onClick={() => setColorMode('system')}>
          system
        </Button>
      </Stack>
    </>
  );
};
export default Appearance;
