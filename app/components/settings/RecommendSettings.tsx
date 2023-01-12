import { FormControl, FormLabel, useRadioGroup, SimpleGrid } from '@chakra-ui/react';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import { useTypedFetcher } from 'remix-typedjson';
import type { action } from '~/routes/$id/add';

const RecommendSettings = ({allowRecommend}: { allowRecommend: string }) => {
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
    name: 'allow-recommend',
    defaultValue: allowRecommend,
    onChange: (value) => onChange(value),
  });
  const group = getRootProps();
  return (
    <>
      <FormControl
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={['10px', null, '20px']}
      >
        <FormLabel htmlFor="allow-recommend" mb="0">
          allow recommendations
        </FormLabel>
        <SimpleGrid columns={[1, null, 3]} gap={4} {...group} p={0} m={0}>
          {options.map(({ value, name }) => {
            const radio = getRadioProps({ value });
            return (
              <RadioButtons key={value} {...radio} value={value}>
                {name}
              </RadioButtons>
            );
          })}
        </SimpleGrid>
      </FormControl>
    </>
  );
};
export default RecommendSettings;
