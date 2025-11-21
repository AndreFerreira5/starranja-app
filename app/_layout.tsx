import { tamaguiConfig } from '@/tamagui.config';
import { Stack } from "expo-router";
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import './global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TamaguiProvider>
  );
}
