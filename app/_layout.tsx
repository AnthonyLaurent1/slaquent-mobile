import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProviders } from '@/providers/app-providers';

const navigationThemes: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      border: Colors.light.border,
      card: Colors.light.surface,
      notification: Colors.light.accent,
      primary: Colors.light.accent,
      text: Colors.light.text,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      border: Colors.dark.border,
      card: Colors.dark.surface,
      notification: Colors.dark.accent,
      primary: Colors.dark.accent,
      text: Colors.dark.text,
    },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';

  return (
    <ThemeProvider value={navigationThemes[colorScheme]}>
      <AppProviders>
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: Colors[colorScheme].background },
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="feed" />
          <Stack.Screen name="conversations" />
          <Stack.Screen name="chat/[roomId]" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </AppProviders>
    </ThemeProvider>
  );
}
