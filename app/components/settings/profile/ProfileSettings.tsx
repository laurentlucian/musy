import { useState } from 'react';

import { Box, useColorModeValue, Stack } from '@chakra-ui/react';

import { ArrowDown3, Blur, Eye, EyeSlash } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

import ThemeToggle from '../ThemeToggle';
import PlayerButtonSettings from './PlayerButtonSettings';
import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';
import ColorPickers from './theme/ColorPickers';
import SaveThemeButton from './theme/SaveThemeButton';
import ToggleSetting from './theme/ToggleSetting';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  const [showSave, setShowSave] = useState(false);
  const [picker, setPicker] = useState<number>(-1);
  const [theme, setTheme] = useState(
    currentUser?.theme ?? {
      backgroundDark: '#090808',
      backgroundLight: '#EEE6E2',
      bgGradientDark: 'linear(to-t, #090808 50%, #fcbde2 110%)',
      bgGradientLight: 'linear(to-t, #EEE6E2 50%, #fcbde2 110%)',
      blur: true,
      customPlayer: null,
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

  const bg = useColorModeValue(theme.backgroundLight, theme.backgroundDark);
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bgGradientDark = `linear(to-t, #090808 40%, ${theme.gradientColorDark} 90%)`;
  const bgGradientLight = `linear(to-t, #EEE6E2 40%, ${theme.gradientColorLight} 90%)`;
  const bgGradient = useColorModeValue(bgGradientLight, bgGradientDark);

  if (!currentUser) return null;

  // @todo connect all appearance options to save button

  console.log('blur: ', theme.blur, 'opaque: ', theme.opaque);

  return (
    <>
      <Stack>
        <ThemeToggle />
        <PlayerButtonSettings playerButtonRight={currentUser.settings?.playerButtonRight} />
        <ToggleSetting
          themeValue={theme.gradient}
          setTheme={setTheme}
          icon={<ArrowDown3 />}
          title="Gradient"
          label="gradient background"
          setShowSave={setShowSave}
        />
        <ToggleSetting
          themeValue={theme.opaque}
          setTheme={setTheme}
          icon={theme.opaque ? <EyeSlash /> : <Eye />}
          title="Opaque"
          label="opaque player"
          value={theme.opaque}
          setShowSave={setShowSave}
        />
        <ToggleSetting
          themeValue={theme.blur}
          setTheme={setTheme}
          icon={<Blur />}
          title="Blur"
          label="blur player"
          value={theme.blur}
          setShowSave={setShowSave}
        />
      </Stack>
      <Stack w="100%">
        <Stack direction={['column', 'row']}>
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
            submission={{
              backgroundDark: theme.backgroundDark,
              backgroundLight: theme.backgroundLight,
              //eventually will pass whole theme object
              blur: theme.blur,
              gradient: theme.gradient,
              gradientColorDark: theme.gradientColorDark,
              gradientColorLight: theme.gradientColorLight,
              mainTextDark: theme.mainTextDark,
              mainTextLight: theme.mainTextLight,
              opaque: theme.opaque,
              playerColorDark: theme.playerColorDark,
              playerColorLight: theme.playerColorLight,
              subTextDark: theme.subTextDark,
              subTextLight: theme.subTextLight,
            }}
          />
        </Stack>
        <Box h="300px" />
      </Stack>
    </>
  );
};

export default ProfileSettings;
