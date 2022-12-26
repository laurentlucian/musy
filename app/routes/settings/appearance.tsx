import { useColorMode, Button, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import TimeRangePicker from '~/components/settings/TimeRangePicker';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const Appearance = () => {
  const [scheduled, setScheduled] = useState(false);
  const { setColorMode } = useColorMode();
  return (
    <>
      <Stack direction="row" alignItems="center">
        <Text>Scheduled:</Text>
        <Button aria-label="off" onClick={() => setScheduled(false)}>
          off
        </Button>
        <Button aria-label="on" onClick={() => setScheduled(true)}>
          on
        </Button>
        {scheduled && <TimeRangePicker />}
      </Stack>
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

// {seconds.map((second) => (
//   {/* If the second is less than 10, add a 0 prefix */}
//   let newSecond = second < 10 ? '0' + second : second;
//   return <option>{newSecond}</option>;
// ))}
