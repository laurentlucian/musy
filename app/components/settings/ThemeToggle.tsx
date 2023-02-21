import { Check } from 'react-feather';

import {
  useColorMode,
  Stack,
  useRadioGroup,
  HStack,
  useColorModeValue,
  Box,
  IconButton,
  Text,
} from '@chakra-ui/react';

import { Moon, Sun1 } from 'iconsax-react';

// import TimeRangePicker from '~/components/settings/TimeRangePicker';
import useIsMobile from '~/hooks/useIsMobile';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';

import Tooltip from '../Tooltip';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const ThemeToggle = () => {
  // const [scheduled, setScheduled] = useState(false);
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('music.800', 'white');
  // const bg = useColorModeValue('white', 'music.800');
  const defaultValue = color === 'music.800' ? 'light' : 'dark';
  let reloadTimeout: NodeJS.Timeout;
  const onChange = (value: string) => {
    setColorMode(value);
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

  const Mobile = (
    <Stack {...group} w="100%">
      {options.map(({ icon, name, value }) => {
        const radio = getRadioProps({ value });
        return (
          <RadioButtons key={value} {...radio} value={value}>
            <HStack justifyContent="space-between">
              {radio.isChecked ? (
                <>
                  <HStack gap={2} w="100%">
                    <Box color="#1DB954">{icon}</Box>
                    <Text>{name}</Text>
                  </HStack>
                  <Check />
                </>
              ) : (
                <HStack gap={2} w="100%">
                  <Box color="#555555">{icon}</Box>
                  <Text>{name}</Text>
                </HStack>
              )}
            </HStack>
          </RadioButtons>
        );
      })}
    </Stack>
  );

  const onToggle = () => {
    toggleColorMode();
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
      location.reload();
    }, 100);
  };

  const Desktop = (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Tooltip label="toggle theme" hasArrow openDelay={300}>
        <IconButton
          aria-label="toggle theme"
          icon={colorMode === 'dark' ? <Moon variant="Bold" /> : <Sun1 variant="Bold" />}
          onClick={onToggle}
          border={` 1px solid ${color} `}
          borderRadius="md"
        />
      </Tooltip>
    </Box>
  );

  return isSmallScreen ? Mobile : Desktop;
};

export default ThemeToggle;
