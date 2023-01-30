import {
  useColorMode,
  Button,
  Stack,
  Text,
  useRadioGroup,
  SimpleGrid,
  HStack,
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

  const options = [
    { name: 'dark', value: 'dark' },
    { name: 'light', value: 'light' },
    { name: 'system', value: 'system' },
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'appearance',
    defaultValue: 'dark', // fix default value to be stored value
    onChange: setSelection,
  });

  const group = getRootProps();

  useEffect(() => {
    if (selection) setColorMode(selection);
  }, [selection, setColorMode]);

  return (
    <Stack spacing={5} w={['unset', '400px']}>
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
      <SimpleGrid gap={[0, 2]} {...group} p={0} m={0}>
        {options.map(({ value, name }) => {
          const radio = getRadioProps({ value });

          return (
            <RadioButtons key={value} {...radio} value={value} isDisabled>
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
