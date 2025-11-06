import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from '@/tamagui.config';
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <Slot />
    </TamaguiProvider>
  );
}
