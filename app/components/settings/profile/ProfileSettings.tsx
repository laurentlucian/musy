import { useRef, useState } from 'react';
import { type ColorResult } from 'react-color';

import { Box, useColorModeValue, Stack, useColorMode } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import GradientSettings from './GradientSettings';
import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';
import ColorPicker from './theme/ColorPicker';
import SaveThemeButton from './theme/SaveThemeButton';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  const [showSave, setShowSave] = useState(false);
  const [picker, setPicker] = useState<number>();
  const [theme, setTheme] = useState(
    currentUser?.theme ?? {
      backgroundDark: '#090808',
      backgroundLight: '#EEE6E2',
      bgGradientDark: 'linear(to-t, #090808 50%, #fcbde2 110%)',
      bgGradientLight: 'linear(to-t, #EEE6E2 50%, #fcbde2 110%)',
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
      userId: currentUser?.userId ?? '',
    },
  );

  const { colorMode } = useColorMode();
  const bg = useColorModeValue(theme.backgroundLight, theme.backgroundDark);
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bgGradientDark = `linear(to-t, #090808 40%, ${theme.gradientColorDark} 90%)`;
  const bgGradientLight = `linear(to-t, #EEE6E2 40%, ${theme.gradientColorLight} 90%)`;
  const bgGradient = useColorModeValue(bgGradientLight, bgGradientDark);

  const onChange = (col: ColorResult, property: string) => {
    setTheme((prevTheme) => ({ ...prevTheme, [property]: col.hex }));
    setShowSave(true);
  };

  const colorPickerRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  return (
    <Stack>
      <GradientSettings />
      <Box
        h="400px"
        border={`solid 1px ${color}`}
        borderRadius="10px"
        bgGradient={theme.gradient ? bgGradient : undefined}
        bg={!theme.gradient ? bg : undefined}
      >
        <ProfileHeader profile={currentUser} />
        <Player track={currentUser.settings?.profileSong} theme={theme} />
      </Box>
      {colorMode === 'dark' ? (
        <>
          <ColorPicker
            bgCol={theme.gradientColorDark}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={0}
            title="Gradient"
            themeProp="gradientColorDark"
          />
          <ColorPicker
            bgCol={theme.playerColorDark}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={1}
            title="Player"
            themeProp="playerColorDark"
          />
          <ColorPicker
            bgCol={theme.mainTextDark}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={2}
            title="Player Main"
            themeProp="mainTextDark"
          />
          <ColorPicker
            bgCol={theme.subTextDark}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={3}
            title="Player Sub"
            themeProp="subTextDark"
          />
        </>
      ) : (
        <>
          <ColorPicker
            bgCol={theme.gradientColorLight}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={4}
            title="Gradient"
            themeProp="gradientColorLight"
          />
          <ColorPicker
            bgCol={theme.playerColorLight}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={5}
            title="Player"
            themeProp="playerColorLight"
          />
          <ColorPicker
            bgCol={theme.mainTextLight}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={6}
            title="Player Main"
            themeProp="mainTextLight"
          />
          <ColorPicker
            bgCol={theme.subTextLight}
            onChange={onChange}
            ref={colorPickerRef}
            setPicker={setPicker}
            picker={picker}
            index={7}
            title="Player Sub"
            themeProp="subTextLight"
          />
        </>
      )}

      <SaveThemeButton
        showSave={showSave}
        setShowSave={setShowSave}
        color={color}
        setPicker={setPicker}
        submission={{
          //eventually will pass whole theme object
          gradientColorDark: theme.gradientColorDark,
          gradientColorLight: theme.gradientColorLight,
          mainTextDark: theme.mainTextDark,
          mainTextLight: theme.mainTextLight,
          playerColorDark: theme.playerColorDark,
          playerColorLight: theme.playerColorLight,
          subTextDark: theme.subTextDark,
          subTextLight: theme.subTextLight,
        }}
      />
    </Stack>
  );
};

export default ProfileSettings;
