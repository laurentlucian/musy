import { Check } from 'react-feather';

import { FormControl, FormLabel, useRadioGroup, SimpleGrid, HStack } from '@chakra-ui/react';

import { Layer } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import { RadioButtons } from '~/lib/theme/components/SettingsRadio';
import type { action } from '~/routes/$id/add';

const RecommendSettings = ({ allowRecommend }: { allowRecommend: string }) => {
  const fetcher = useTypedFetcher<typeof action>();
  const onChange = (value: string) => {
    fetcher.submit({ 'allow-recommend': value }, { method: 'post', replace: true });
  };
  const options = [
    { name: 'off', value: 'off' },
    { name: 'on', value: 'on' },
    { name: 'link only', value: 'link' },
  ];
  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: allowRecommend,
    name: 'allow-recommend',
    onChange: (value) => onChange(value),
  });
  const group = getRootProps();
  return (
    <>
      <FormControl display="flex" flexDirection="column" gap={['10px', null, '20px']}>
        <HStack>
          <Layer color={allowRecommend === 'off' ? '#555555' : '#1DB954'} />
          <FormLabel htmlFor="allow-recommend" mb="0">
            recommendations
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
export default RecommendSettings;
