import {
  useColorMode,
  Button,
  Stack,
  Text,
  useRadioGroup,
  SimpleGrid,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import TimeRangePicker from '~/components/settings/TimeRangePicker';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const Appearance = () => {
  const [scheduled, setScheduled] = useState(false);
  const [selection, setSelection] = useState('');
  const { setColorMode } = useColorMode();
  const color = useColorModeValue('music.800', 'white');
  const defaultValue = color === 'music.800' ? 'light' : 'dark';
  const options = [
    { name: 'dark', value: 'dark' },
    { name: 'light', value: 'light' },
    // { name: 'system', value: 'system' }, //<---- will return when we can store a default value
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'appearance',
    defaultValue, // fix default value to be stored value
    onChange: setSelection,
  });

  const group = getRootProps();

  useEffect(() => {
    if (selection) setColorMode(selection);
  }, [selection, setColorMode]);

  return (
    <Stack spacing={5} w={['unset', '400px']}>
      <Stack direction="row" alignItems="center">
        <Text fontSize={['sm', 'md']} color={color}>
          scheduled:
        </Text>
        <Button size={['xs', 'sm']} aria-label="off" onClick={() => setScheduled(false)}>
          off
        </Button>
        <Button size={['xs', 'sm']} aria-label="on" onClick={() => setScheduled(true)}>
          on
        </Button>
        {scheduled && <TimeRangePicker />}
      </Stack>
      <SimpleGrid gap={[0, 2]} {...group} p={0} m={0}>
        {options.map(({ value, name }) => {
          const radio = getRadioProps({ value });

          return (
            <RadioButtons key={value} {...radio} value={value}>
              <HStack justifyContent="space-between">
                {radio.isChecked ? (
                  <>
                    {name}
                    <Check />
                  </>
                ) : (
                  <>{name}</>
                )}
              </HStack>
            </RadioButtons>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};
export default Appearance;
