import type { Theme } from '@prisma/client';
import { create } from 'zustand';

interface ThemeStateConfig {
  setTheme: (updateTheme: (prevTheme: Theme) => Theme) => void;
  theme: Theme;
}

const useThemeStore = create<ThemeStateConfig>((set) => ({
  setTheme: (updateTheme: (prevTheme: Theme) => Theme) =>
    set((state) => ({ theme: updateTheme(state.theme) })),
  theme: {
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
    userId: '',
  },
}));

export default useThemeStore;
