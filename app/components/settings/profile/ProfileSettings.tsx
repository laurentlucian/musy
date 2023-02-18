import { useSubmit, useTransition } from '@remix-run/react';
import { useRef, useState } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';

import {
  Box,
  useColorModeValue,
  useColorMode,
  Collapse,
  HStack,
  Text,
  Stack,
  Button,
} from '@chakra-ui/react';

import Waver from '~/components/icons/Waver';
import useSessionUser from '~/hooks/useSessionUser';

import GradientSettings from './GradientSettings';
import { default as Player } from './SettingsPlayer';
import { default as ProfileHeader } from './SettingsProfileHeader';

const ProfileSettings = () => {
  const currentUser = useSessionUser();
  const [showPicker, setShowPicker] = useState(false);
  const [showPicker1, setShowPicker1] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [text, setText] = useState('Save');
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
      userId: currentUser?.userId,
    },
  );

  const bg = useColorModeValue('#EEE6E2', '#090808');
  const color = useColorModeValue(theme.mainTextLight, theme.mainTextDark);
  const { colorMode } = useColorMode();
  const bgGradientDark = `linear(to-t, #090808 40%, ${theme.gradientColorDark} 90%)`;
  const bgGradientLight = `linear(to-t, #EEE6E2 40%, ${theme.gradientColorLight} 90%)`;
  const bgGradient = useColorModeValue(bgGradientLight, bgGradientDark);

  const onChange = (col: ColorResult) => {
    setTheme((prevTheme) => ({ ...prevTheme, gradientColorDark: col.hex }));
    setShowSave(true);
  };
  const onChange1 = (col: ColorResult) => {
    setTheme((prevTheme) => ({ ...prevTheme, gradientColorLight: col.hex }));
    setShowSave(true);
  };

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const transition = useTransition();

  if (!currentUser) return null;

  return (
    <Stack
    // onClick={() => {
    //   setShowPicker(false);
    //   setShowPicker1(false);
    // }}
    >
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
      <HStack>
        <Box
          p="1px"
          bg={theme.gradientColorDark}
          boxSize="20px"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
            setShowPicker1(false);
            const delayScroll = setTimeout(() => {
              colorPickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 0);
            return () => clearTimeout(delayScroll);
          }}
        />
        <Text>Gradient Dark</Text>
      </HStack>
      <Collapse in={showPicker}>
        <div ref={colorPickerRef}>
          <SketchPicker color={theme.gradientColorDark} onChange={(col) => onChange(col)} />
        </div>
      </Collapse>
      <HStack>
        <Box
          p="1px"
          bg={theme.gradientColorLight}
          boxSize="20px"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker1(!showPicker1);
            setShowPicker(false);
            const delayScroll = setTimeout(() => {
              colorPickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 0);
            return () => clearTimeout(delayScroll);
          }}
        />
        <Text>Gradient Light</Text>
      </HStack>
      <Collapse in={showPicker1}>
        <div ref={colorPickerRef}>
          <SketchPicker color={theme.gradientColorLight} onChange={(col) => onChange1(col)} />
        </div>
      </Collapse>
      <Button
        pos="fixed"
        bottom={showSave ? 2 : '-50px'}
        right={2}
        bg={bg}
        color={color}
        isLoading={transition.submission?.action.includes('/settings/appearance')}
        spinner={<Waver />}
        onClick={() => {
          submit(
            {
              bgGradientDark: `linear(to-t, #090808 50%, ${theme.gradientColorDark} 110%)`,
              bgGradientLight: `linear(to-t, #EEE6E2 50%, ${theme.gradientColorDark} 110%)`,
              gradientColorDark: theme.gradientColorDark,
              gradientColorLight: theme.gradientColorLight,
            },

            { method: 'post', replace: true },
          );
          setText('Saved');
          const delayExit = setTimeout(() => {
            setShowSave(false);
            setText('Save');
          }, 1000);
          return () => clearTimeout(delayExit);
        }}
        transition="bottom 0.25s"
      >
        {text}
      </Button>
      <Box h="300px" ref={colorPickerRef} />
    </Stack>
  );
};

export default ProfileSettings;
