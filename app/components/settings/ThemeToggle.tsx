import { useEffect, useState } from 'react';
import { Check } from 'react-feather';

import {
  useColorMode,
  Stack,
  useRadioGroup,
  SimpleGrid,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';

import { Moon, Sun1 } from 'iconsax-react';

// import TimeRangePicker from '~/components/settings/TimeRangePicker';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const ThemeToggle = () => {
  // const [scheduled, setScheduled] = useState(false);
  const [selection, setSelection] = useState('');
  const { setColorMode } = useColorMode();
  const color = useColorModeValue('music.800', 'white');
  // const bg = useColorModeValue('white', 'music.800');
  const defaultValue = color === 'music.800' ? 'light' : 'dark';
  let reloadTimeout: NodeJS.Timeout;
  const onChange = (value: string) => {
    setSelection(value);
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
      location.reload();
    }, 100);
  };

  const options = [
    {
      icon: <Moon size="24" variant="Bold" />,
      name: 'dark',
      value: 'dark',
    },
    {
      icon: <Sun1 size="24" variant="Bold" />,
      name: 'light',
      value: 'light',
    },
    // { name: 'system', value: 'system' }, //<---- will return when we can store a default value
  ];
  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue, // fix default value to be stored value
    name: 'ThemeToggle',
    onChange: (value) => onChange(value),
  });

  const group = getRootProps();

  useEffect(() => {
    if (selection) setColorMode(selection);
  }, [selection, setColorMode]);

  return (
    <Stack spacing={5} w={['unset', '400px']}>
      {/* <Stack direction="row" alignItems="center">
        <Text fontSize={['sm', 'md']} color={color}>
          scheduled:
        </Text>
        <Button
          size={['xs', 'sm']}
          aria-label="off"
          onClick={() => setScheduled(false)}
          bg={bg}
          color={color}
        >
          off
        </Button>
        <Button
          size={['xs', 'sm']}
          aria-label="on"
          onClick={() => setScheduled(true)}
          bg={bg}
          color={color}
        >
          on
        </Button>
        {scheduled && <TimeRangePicker />}
      </Stack> */}
      <SimpleGrid gap={[0, 2]} {...group} p={0} m={0}>
        {options.map(({ icon, name, value }) => {
          const radio = getRadioProps({ value });
          return (
            <RadioButtons key={value} {...radio} value={value}>
              <HStack justifyContent="space-between">
                {radio.isChecked ? (
                  <>
                    <HStack gap={2} w="100%">
                      <Stack color="#1DB954">{icon}</Stack>
                      <>{name}</>
                    </HStack>
                    <Check />
                  </>
                ) : (
                  <HStack gap={2} w="100%">
                    <Stack color="#555555">{icon}</Stack>
                    <>{name}</>
                  </HStack>
                )}
              </HStack>
            </RadioButtons>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};

export default ThemeToggle;
