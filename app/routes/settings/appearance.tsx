import { useColorMode, Button, Stack, Text, useRadioGroup, HStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import TimeRangePicker from '~/components/settings/TimeRangePicker';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const Appearance = () => {
  const [scheduled, setScheduled] = useState(false);
  const [selection, setSelection] = useState('');
  const { setColorMode } = useColorMode();

  const options = [
    { name: 'dark', value: 'dark' },
    { name: 'light', value: 'light' },
    { name: 'system', value: 'system' },
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'appearance',
    defaultValue: 'system',
    onChange: setSelection,
  });

  const group = getRootProps();

  useEffect(() => {
    if (selection) setColorMode(selection);
  }, [selection, setColorMode]);

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
      <HStack spacing={4} {...group} p={0} m={0}>
        {options.map(({ value, name }) => {
          const radio = getRadioProps({ value });

          return (
            <RadioButtons key={value} {...radio} value={value}>
              {name}
            </RadioButtons>
          );
        })}
      </HStack>
    </>
  );
};
export default Appearance;
