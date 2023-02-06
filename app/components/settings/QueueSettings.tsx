import { Check } from 'react-feather';

import { FormControl, FormLabel, useRadioGroup, SimpleGrid, HStack } from '@chakra-ui/react';

import { Layer } from 'iconsax-react';

import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { type SubmitFunction } from '@remix-run/react';

const QueueSettings = ({ allowQueue, submit }: { allowQueue: string; submit: SubmitFunction }) => {
  const onChange = (value: string) => {
    submit({ 'allow-queue': value }, { method: 'post', replace: true });
  };
  const options = [
    { name: 'off', value: 'off' },
    { name: 'on', value: 'on' },
    { name: 'link only', value: 'link' },
  ];
  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: allowQueue,
    name: 'allow-queue',
    onChange: (value) => onChange(value),
  });
  const group = getRootProps();

  return (
    <>
      <FormControl
        display="flex"
        flexDirection="column"
        gap={['10px', null, '20px']}
        alignContent="center"
      >
        <HStack>
          <Layer color={allowQueue === 'off' ? '#555555' : '#1DB954'} variant="Bold" />
          <FormLabel htmlFor="allow-queue" mb="0">
            queue
          </FormLabel>
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
    </>
  );
};
export default QueueSettings;
