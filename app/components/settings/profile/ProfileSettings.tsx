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

import GradientSettings from './GradientSettings';
import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  // const theme = currentUser?.theme ?? {
  //   backgroundDark: '#090808',
  //   backgroundLight: '#EEE6E2',
  //   blur: true,
  //   gradient: false,
  //   isPreset: true,
  //   mainTextDark: '#EEE6E2',
  //   mainTextLight: '#161616',
  //   musyLogo: 'musy',
  //   opaque: false,
  //   playerColorDark: '#101010',
  //   playerColorLight: '#E7DFD9',
  //   subTextDark: '#EEE6E2',
  //   subTextLight: '#161616',
  //   userId: currentUser?.userId,
  // };

  const [bgPlacement, setBgPlacement] = useState(90);
  const [subPlacement, setSubPlacement] = useState(40);
  const [showPicker, setShowPicker] = useState(false);
  // const [lightBgColor, setLightBgColor] = useState('#EEE6E2');
  // const [darkBgColor, setDarkBgColor] = useState('#050404');
  // const [lightGradientColor, setLightGradientColor] = useState('#fcbde2');
  // const [darkGradientColor, setDarkGradientColor] = useState('#fcbde2');
  // const [lightMainColor, setLightMainColor] = useState('#050404');
  // const [darkMainColor, setDarkMainColor] = useState('#EEE6E2');
  const [theme, setTheme] = useState(
    currentUser?.theme ?? {
      backgroundDark: '#090808',
      backgroundLight: '#EEE6E2',
      blur: true,
      gradient: false,
      gradientColorDark: '#fcbde2',
      gradientColorLight: '#fcbde2',
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
    },
  );

  const bg = useColorModeValue(theme.backgroundLight, theme.backgroundDark);
  const color = useColorModeValue(theme.mainTextLight, theme.mainTextDark);
  const gradientColor = useColorModeValue(theme.gradientColorLight, theme.gradientColorDark);
  const { colorMode } = useColorMode();
  const bgGradient = `linear(to-t, ${bg} ${subPlacement}%, ${gradientColor} ${bgPlacement}%)`;

  if (!currentUser) return null;

  // console.log('theme: ', currentUser.theme);

  return (
    <>
      <GradientSettings />
      <Box
        h="400px"
        border={`solid 1px ${color}`}
        borderRadius="10px"
        bgGradient={theme.gradient ? bgGradient : undefined}
        bg={
          !theme.gradient
            ? colorMode === 'dark'
              ? theme.backgroundDark
              : theme.backgroundLight
            : undefined
        }
      >
        <ProfileHeader profile={currentUser} />
        <Player track={currentUser.settings?.profileSong} />
      </Box>

      {/* {currentUser.theme?.gradient && (
        <>
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
      )} */}
    </>
  );
};

export default ProfileSettings;
