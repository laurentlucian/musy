import { FormControl, FormLabel, useRadioGroup, SimpleGrid, HStack } from '@chakra-ui/react';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useTypedFetcher } from 'remix-typedjson';
import type { action } from '~/routes/$id/add';
import { Check } from 'react-feather';

const RecommendSettings = ({ allowRecommend }: { allowRecommend: string }) => {
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
    name: 'allow-recommend',
    defaultValue: allowRecommend,
    onChange: (value) => onChange(value),
  });
  const group = getRootProps();
  return (
    <>
      <FormControl display="flex" flexDirection="column" gap={['10px', null, '20px']}>
        <FormLabel htmlFor="allow-recommend" mb="0">
          recommendations
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
export default RecommendSettings;
