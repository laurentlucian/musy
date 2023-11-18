import { useRef, useState } from 'react';

import { Box, useColorModeValue, Stack } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { useTypedLoaderData } from 'remix-typedjson';

import useCurrentUser from '~/hooks/useCurrentUser';
import type { loader } from '~/routes/settings.appearance';

import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';
import ColorPickers from './theme/ColorPickers';
import SaveThemeButton from './theme/SaveThemeButton';
import ToggleSettings from './theme/ToggleSettings';

const ProfileSettings = () => {
  const { theme: currentTheme } = useTypedLoaderData<typeof loader>();
  const currentUser = useCurrentUser();
  const [playerBtnSide, setPlayerBtnSide] = useState(
    currentUser?.settings?.playerButtonRight ? true : false,
  );
  const [picker, setPicker] = useState<number>(-1);
  const [theme, setTheme] = useState<Theme>(
    currentTheme ?? {
      backgroundDark: '#090808',
      backgroundLight: '#EEE6E2',
      bgGradientDark: 'linear(to-t, #090808 50%, #fcbde2 110%)',
      bgGradientLight: 'linear(to-t, #EEE6E2 50%, #fcbde2 110%)',
      blur: true,
      customPlayer: null,
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
      userId: currentUser?.userId ?? '',
    },
  );

  const bg = useColorModeValue(theme.backgroundLight, theme.backgroundDark);
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bgGradientDark = `linear(to-t, #090808 40%, ${theme.backgroundDark} 90%)`;
  const bgGradientLight = `linear(to-t, #EEE6E2 40%, ${theme.backgroundLight} 90%)`;
  const bgGradient = useColorModeValue(bgGradientLight, bgGradientDark);

  const constraintRef = useRef(null);

  if (!currentUser) return null;

  return (
    <Stack>
      <Stack direction={['column', 'row']} w="100%" h="100%" ref={constraintRef}>
        <ToggleSettings
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
          <ColorPickers setTheme={setTheme} theme={theme} setPicker={setPicker} picker={picker} />
        </Stack>
        <Box h="300px" />
      </Stack>
      <SaveThemeButton
        color={color}
        setPicker={setPicker}
        setTheme={setTheme}
        theme={theme}
        playerBtnSide={playerBtnSide}
      />
    </Stack>
  );
};

export default ProfileSettings;
