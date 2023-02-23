import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import {
  Box,
  IconButton,
  useColorModeValue,
  FormControl,
  HStack,
  FormLabel,
} from '@chakra-ui/react';

import { ArrangeHorizontal } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';

const PlayerButtonSettings = ({ playerButtonRight }: { playerButtonRight?: boolean }) => {
  const [playerBtnSide, setPlayerBtnSide] = useState(playerButtonRight ? true : false);
  const color = useColorModeValue('music.800', 'white');
  const isSmallScreen = useIsMobile();
  const submit = useSubmit();

  const onToggle = () => {
    setPlayerBtnSide(!playerBtnSide);
    submit(
      { 'player-button-side': `${!playerBtnSide}` },

      { method: 'post', replace: true },
    );
  };

  const Desktop = (
    <FormControl display="flex" alignItems="center" justifyContent="space-between">
      <HStack>
        {isSmallScreen && (
          <FormLabel fontSize={['sm', 'md']} htmlFor="player button side" mb="0" color={color}>
            player button side
          </FormLabel>
        )}
      </HStack>
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
    </FormControl>
  );

  return Desktop;
};
export default PlayerButtonSettings;
