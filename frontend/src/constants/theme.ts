import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#09090B',
    background: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    textSecondary: '#71717A',
    primary: '#7C5CFF',
    secondary: '#5EEAD4',
    accent: '#38BDF8',
  },
  dark: {
    text: '#FFFFFF',
    background: '#09090B',
    backgroundElement: 'rgba(255,255,255,0.08)',
    backgroundSelected: 'rgba(255,255,255,0.15)',
    textSecondary: '#A1A1AA',
    primary: '#7C5CFF',
    secondary: '#5EEAD4',
    accent: '#38BDF8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
