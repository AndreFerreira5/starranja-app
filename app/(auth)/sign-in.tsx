import { Button, Input, YStack, Text } from 'tamagui';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const submit = async () => {
  // Skip validation during development
  setIsSubmitting(true);
  try {
    // Backend será ligado mais tarde
    router.replace('/(tabs)');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$4"
      gap="$4"
    >
      <Input
        size="$4"
        width="100%"
        maxWidth={400}
        placeholder="Introduza o seu nome de utilizador"
        value={form.username}
        onChangeText={(text) => setForm((prev) => ({ ...prev, username: text }))}
        autoCapitalize="none"
        disabled={isSubmitting}
      />

      <Input
        size="$4"
        width="100%"
        maxWidth={400}
        placeholder="Introduza a sua palavra-passe"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        secureTextEntry
        textContentType="password"
        disabled={isSubmitting}
      />

      <Button
        size="$4"
        width="100%"
        maxWidth={400}
        onPress={submit}
        disabled={isSubmitting}
        opacity={isSubmitting ? 0.5 : 1}
        backgroundColor="orange"
      >
        <Text>{isSubmitting ? 'A enviar...' : 'Iniciar Sessão'}</Text>
      </Button>
    </YStack>
  );
};

export default SignIn;
