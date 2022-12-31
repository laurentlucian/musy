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
        <Text fontSize={['sm', 'md']}>scheduled:</Text>
        <Button size={['xs', 'sm']} aria-label="off" onClick={() => setScheduled(false)}>
          off
        </Button>
        <Button size={['xs', 'sm']} aria-label="on" onClick={() => setScheduled(true)}>
          on
        </Button>
        {scheduled && <TimeRangePicker />}
      </Stack>
      <Stack direction="row">
        <Button size={['xs', 'sm']} aria-label="dark" onClick={() => setColorMode('dark')}>
          dark
        </Button>
        <Button size={['xs', 'sm']} aria-label="light" onClick={() => setColorMode('light')}>
          light
        </Button>
        <Button size={['xs', 'sm']} aria-label="system" onClick={() => setColorMode('system')}>
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
