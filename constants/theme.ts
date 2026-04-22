/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const palette = {
  azure: '#2563EB',
  azureSoft: 'rgba(37, 99, 235, 0.14)',
  night: '#08101F',
  slate: '#8FA1BF',
  surfaceLight: '#FFFFFF',
  surfaceDark: 'rgba(15, 23, 42, 0.82)',
};

export const Colors = {
  light: {
    text: '#0F172A',
    muted: '#5B6B87',
    background: '#EEF4FF',
    surface: palette.surfaceLight,
    card: 'rgba(255, 255, 255, 0.84)',
    input: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(15, 23, 42, 0.08)',
    tint: palette.azure,
    accent: palette.azure,
    accentStrong: '#1D4ED8',
    accentSoft: palette.azureSoft,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: palette.azure,
    bubbleMine: palette.azure,
    bubbleOther: '#FFFFFF',
    success: '#10B981',
    danger: '#EF4444',
  },
  dark: {
    text: '#F8FAFC',
    muted: palette.slate,
    background: palette.night,
    surface: 'rgba(255, 255, 255, 0.05)',
    card: palette.surfaceDark,
    input: 'rgba(15, 23, 42, 0.78)',
    border: 'rgba(255, 255, 255, 0.08)',
    tint: '#60A5FA',
    accent: '#3B82F6',
    accentStrong: '#60A5FA',
    accentSoft: 'rgba(59, 130, 246, 0.16)',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
    bubbleMine: palette.azure,
    bubbleOther: 'rgba(255, 255, 255, 0.08)',
    success: '#34D399',
    danger: '#F87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
