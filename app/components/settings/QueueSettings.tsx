import { Check } from 'react-feather';
import { FormControl, FormLabel, useRadioGroup, SimpleGrid, HStack } from '@chakra-ui/react';
import { useTypedFetcher } from 'remix-typedjson';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import type { action } from '~/routes/$id/add';
import { Layer } from 'iconsax-react';

const QueueSettings = (allowQueue: { allowQueue: string }) => {
  const fetcher = useTypedFetcher<typeof action>();
  const onChange = (value: string) => {
    fetcher.submit({ 'allow-queue': value }, { method: 'post', replace: true });
  };
  const options = [
    { name: 'off', value: 'off' },
    { name: 'on', value: 'on' },
    { name: 'link only', value: 'link' },
  ];
  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: allowQueue.allowQueue,
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
          <Layer color={allowQueue.allowQueue === 'off' ? '#555555' : '#1DB954'} variant="Bold" />
          <FormLabel htmlFor="allow-queue" mb="0">
            Queue
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
