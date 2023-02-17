import { useState } from 'react';

import {
  Box,
  useColorModeValue,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorMode,
} from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  const theme = currentUser?.theme ?? {
    backgroundDark: '#090808',
    backgroundLight: '#EEE6E2',
    blur: true,
    gradient: false,
    isPreset: true,
    mainTextDark: '#EEE6E2',
    mainTextLight: '#161616',
    musyLogo: 'musy',
    opaque: false,
    playerColorDark: '#101010',
    playerColorLight: '#E7DFD9',
    subTextDark: '#EEE6E2',
    subTextLight: '#161616',
    userId: currentUser?.userId,
  };

  const [bgPlacement, setBgPlacement] = useState(90);
  const [subPlacement, setSubPlacement] = useState(40);
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#050404', '#EEE6E2');
  const { colorMode } = useColorMode();
  const bgGradient = `linear(to-t, ${bg} ${subPlacement}%, #fcbde2 ${bgPlacement}%)`;

  if (!currentUser) return null;

  return (
    <>
      <Box
        h="400px"
        border={`solid 1px ${color}`}
        borderRadius="10px"
        bgGradient={theme.gradient ? bgGradient : undefined}
        bg={colorMode === 'dark' && !theme.gradient ? theme.backgroundDark : theme.backgroundLight}
      >
        <ProfileHeader profile={currentUser} />
        <Player track={currentUser.settings?.profileSong} />
      </Box>
      <Slider
        aria-label="gradient from"
        defaultValue={bgPlacement}
        min={subPlacement}
        onChange={setBgPlacement}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Slider aria-label="gradient to" defaultValue={subPlacement} onChange={setSubPlacement}>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  );
};

export default ProfileSettings;
