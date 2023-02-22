import { useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { Check } from 'react-feather';

import {
  useRadioGroup,
  HStack,
  FormControl,
  FormLabel,
  Box,
  IconButton,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';

import { ArrangeHorizontal } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import { RadioButtons } from '~/lib/theme/components/SettingsRadio';

// changes color mode but when navigating to new page it changes color back unless you refresh before route change

const PlayerButtonSettings = ({ playerButtonRight }: { playerButtonRight?: boolean }) => {
  const [playerBtnSide, setPlayerBtnSide] = useState(playerButtonRight ? true : false);
  const defaultValue = playerButtonRight ? 'true' : 'false';
  const color = useColorModeValue('music.800', 'white');
  const isSmallScreen = useIsMobile();
  const submit = useSubmit();
  const onChange = (value: string) => {
    submit({ 'player-button-side': value }, { method: 'post', replace: true });
  };
  const options = [
    {
      icon: (
        <Box transform="rotateX(180deg)">
          <ArrangeHorizontal size="24" variant="TwoTone" />
        </Box>
      ),
      name: 'left',
      value: 'false',
    },
    {
      icon: (
        <Box transform="rotateY(180deg)">
          <ArrangeHorizontal size="24" variant="TwoTone" />
        </Box>
      ),
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

  const Mobile = (
    <FormControl display="flex" flexDirection="column" gap="10px" {...group}>
      <HStack>
        <ArrangeHorizontal size="24" variant="TwoTone" color="#1DB954" />
        <FormLabel htmlFor="player-button-side">player button placement</FormLabel>
      </HStack>
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
    </FormControl>
  );

  const onToggle = () => {
    setPlayerBtnSide(!playerBtnSide);
    submit(
      { 'player-button-side': `${!playerBtnSide}` },

      { method: 'post', replace: true },
    );
  };

  const Desktop = (
    <Flex alignItems="center" justifyContent="space-between">
      <Tooltip label="player button side" hasArrow openDelay={300}>
        <IconButton
          aria-label="player button side"
          icon={
            playerButtonRight ? (
              <Box transform="rotateY(180deg)">
                <ArrangeHorizontal variant="TwoTone" />
              </Box>
            ) : (
              <Box transform="rotateX(180deg)">
                <ArrangeHorizontal variant="TwoTone" />
              </Box>
            )
          }
          onClick={onToggle}
          border={` 1px solid ${color} `}
          borderRadius="md"
        />
      </Tooltip>
    </Flex>
  );

  return isSmallScreen ? Mobile : Desktop;
};
export default PlayerButtonSettings;
