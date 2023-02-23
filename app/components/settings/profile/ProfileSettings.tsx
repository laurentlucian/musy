import { useState } from 'react';

import { Box, useColorModeValue, Stack } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';
import ColorPickers from './theme/ColorPickers';
import SaveThemeButton from './theme/SaveThemeButton';
import ToggleSettings from './theme/ToggleSettings';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  const [playerBtnSide, setPlayerBtnSide] = useState(
    currentUser?.settings?.playerButtonRight ? true : false,
  );
  const [showSave, setShowSave] = useState(false);
  const [picker, setPicker] = useState<number>(-1);
  const [theme, setTheme] = useState(
    currentUser?.theme ?? {
      backgroundDark: '#090808', //
      backgroundLight: '#EEE6E2', //
      bgGradientDark: 'linear(to-t, #090808 50%, #fcbde2 110%)', //
      bgGradientLight: 'linear(to-t, #EEE6E2 50%, #fcbde2 110%)', //
      blur: true, //
      customPlayer: null,
      gradient: false, //
      gradientColorDark: '#fcbde2', //
      gradientColorLight: '#fcbde2', //
      isPreset: true,
      mainTextDark: '#EEE6E2', //
      mainTextLight: '#161616', //
      musyLogo: 'musy',
      opaque: false, //
      playerColorDark: '#101010', //
      playerColorLight: '#E7DFD9', //
      subTextDark: '#EEE6E2', //
      subTextLight: '#161616', //
      userId: currentUser?.userId ?? '',
    },
  );

  const bg = useColorModeValue(theme.backgroundLight, theme.backgroundDark);
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bgGradientDark = `linear(to-t, #090808 40%, ${theme.gradientColorDark} 90%)`;
  const bgGradientLight = `linear(to-t, #EEE6E2 40%, ${theme.gradientColorLight} 90%)`;
  const bgGradient = useColorModeValue(bgGradientLight, bgGradientDark);

  if (!currentUser) return null;

  // @todo connect all appearance options to save button

  return (
    <Stack direction={['column', 'row']} w="100%">
      <ToggleSettings
        setShowSave={setShowSave}
        setTheme={setTheme}
        theme={theme}
        playerBtnSide={playerBtnSide}
        setPlayerBtnSide={setPlayerBtnSide}
      />
      <Stack direction={['column', 'row']} w="100%">
        <Box
          h="400px"
          border={`solid 1px ${color}`}
          borderRadius="10px"
          bgGradient={theme.gradient ? bgGradient : undefined}
          bg={!theme.gradient ? bg : undefined}
        >
          <ProfileHeader profile={currentUser} />
          <Player track={currentUser.settings?.profileSong} theme={theme} right={playerBtnSide} />
        </Box>
        <Box w="100%">
          <ColorPickers
            setShowSave={setShowSave}
            setTheme={setTheme}
            theme={theme}
            setPicker={setPicker}
            picker={picker}
          />
        </Box>
        <SaveThemeButton
          showSave={showSave}
          setShowSave={setShowSave}
          color={color}
          setPicker={setPicker}
          theme={theme}
          playerBtnSide={playerBtnSide}
        />
      </Stack>
      <Box h="300px" />
    </Stack>
  );
};

export default ProfileSettings;
