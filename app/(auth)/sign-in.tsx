import { Button, Input, YStack, Text } from 'tamagui';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/api/client';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const submit = async () => {
    // Validação básica
    if (!form.username || !form.password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Iniciando login...');
      // Chama o endpoint /auth/login
      const response = await apiClient.post('/auth/login', {
        username: form.username,
        password: form.password,
      });

      console.log('Login bem-sucedido:', response);

      // Guarda o token no AsyncStorage
      await AsyncStorage.setItem('access_token', response.access_token);

      // Redireciona para a app
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Credenciais inválidas');
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
