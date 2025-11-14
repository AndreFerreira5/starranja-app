import { TamaguiProvider, View } from 'tamagui';
import { tamaguiConfig } from '@/tamagui.config';
import { Slot } from 'expo-router';
import { useColorScheme, StyleSheet } from 'react-native'; 
import { Image } from 'expo-image';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <Image
          source={require('../../assets/images/background.jpg')}
          resizeMode="cover"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />

        <View style={styles.overlay}>
          <Slot />
        </View>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 40, 90, 0.6)', 
  },
});