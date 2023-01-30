import { FormControl, FormLabel, useRadioGroup, SimpleGrid, HStack } from '@chakra-ui/react';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useTypedFetcher } from 'remix-typedjson';
import type { action } from '~/routes/$id/add';
import { Check } from 'react-feather';

const QueueSettings = (allowQueue: { allowQueue: string }) => {
  const fetcher = useTypedFetcher<typeof action>();
  const onChange = (value: string) => {
    fetcher.submit({ 'allow-queue': value }, { replace: true, method: 'post' });
  };
  const options = [
    { name: 'off', value: 'off' },
    { name: 'on', value: 'on' },
    { name: 'link only', value: 'link' },
  ];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'allow-queue',
    defaultValue: allowQueue.allowQueue,
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
        <FormLabel htmlFor="allow-queue" mb="0">
          queue
        </FormLabel>
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
      </FormControl>
    </>
  );
};
export default QueueSettings;
