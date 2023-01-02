import { FormControl, FormLabel, useRadioGroup, HStack } from '@chakra-ui/react';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useTypedFetcher } from 'remix-typedjson';
import type { action } from '~/routes/$id/add';

const QueueSettings = (allowQueue: { allowQueue: string }) => {
  const fetcher = useTypedFetcher<typeof action>();
  const onChange = (value: string) => {
    fetcher.submit({ 'allow-queue': value }, { replace: true, method: 'post' });
  };
  const options = [
    { name: 'off', value: 'off' },
    { name: 'on', value: 'on' },
    { name: 'link', value: 'link' },
  ];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'allow-queue',
    defaultValue: allowQueue.allowQueue,
    onChange: (value) => onChange(value),
  });
  const group = getRootProps();
  return (
    <>
      <FormControl display="flex" alignItems="center" justifyContent="space-between" gap="20px">
        <FormLabel htmlFor="allow-queue" mb="0">
          allow queue
        </FormLabel>
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
      </FormControl>
    </>
  );
};
export default QueueSettings;
