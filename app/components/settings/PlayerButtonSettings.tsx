import { Check } from 'react-feather';

import { useRadioGroup, SimpleGrid, HStack, FormControl, FormLabel } from '@chakra-ui/react';

import { ArrangeHorizontal } from 'iconsax-react';

import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useSubmit } from '@remix-run/react';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const PlayerButtonSettings = ({ playerButtonRight }: { playerButtonRight?: boolean }) => {
  const defaultValue = playerButtonRight ? 'true' : 'false';
  console.log(defaultValue);
  const submit = useSubmit();
  const onChange = (value: string) => {
    submit({ 'player-button-side': value }, { method: 'post', replace: true });
  };
  const options = [
    {
      name: 'left',
      value: 'false',
    },
    {
      name: 'right',
      value: 'true',
    },
  ];
  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue,
    name: 'player-button-side',
    onChange,
  });
  const group = getRootProps();
  return (
    <FormControl display="flex" flexDirection="column" gap={['10px', null, '20px']}>
      <HStack>
        <ArrangeHorizontal size="24" variant="TwoTone" color="#1DB954" />
        <FormLabel htmlFor="player-button-side">player button placement</FormLabel>
      </HStack>
      <SimpleGrid gap={[0, 2]} {...group} p={0} m={0}>
        {options.map(({ name, value }) => {
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
    </FormControl>
  );
};
export default PlayerButtonSettings;
