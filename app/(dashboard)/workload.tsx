import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  H1,
  H3,
  Text,
  Card,
  Separator,
  ScrollView,
  Spinner,
  useTheme,
} from 'tamagui';
import { AlertCircle } from 'lucide-react-native';

type MechanicWorkload = {
  id: string;
  mechanicName: string;
  activeOrders: number; // quantos veículos/ordens está a reparar agora
};

export default function WorkloadPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Mock data (sem backend)
  const [workload, setWorkload] = useState<MechanicWorkload[]>([]);

  const fetchWorkload = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      const mock: MechanicWorkload[] = [
        { id: '1', mechanicName: 'Carlos Pereira', activeOrders: 3 },
        { id: '2', mechanicName: 'Rui Almeida', activeOrders: 2 },
        { id: '3', mechanicName: 'Inês Rocha', activeOrders: 1 },
        { id: '4', mechanicName: 'Mariana Lopes', activeOrders: 0 },
      ];

      setWorkload(mock);
    } catch (error: any) {
      console.error('Erro ao carregar workload:', error);
      Alert.alert('Erro', error?.message || 'Não foi possível carregar o workload');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const totalActiveOrders = useMemo(() => {
    return workload.reduce((acc, m) => acc + (m.activeOrders || 0), 0);
  }, [workload]);

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        <H1>Carga de Trabalho</H1>

        <Card elevate padded>
          <YStack space="$2">
            <H3>Total de ordens em curso:</H3>
            <Separator />
            <Text fontSize="$8" fontWeight="800" color="$gray12">
              {loading ? '—' : totalActiveOrders}
            </Text>
          </YStack>
        </Card>

        <Card elevate padded>
          <YStack space="$3">
            <H3>Equipa</H3>
            <Separator />

            {loading ? (
              <XStack justifyContent="center" padding="$4">
                <Spinner size="large" />
              </XStack>
            ) : workload.length === 0 ? (
              <XStack
                justifyContent="center"
                alignItems="center"
                space="$2"
                padding="$4"
              >
                <AlertCircle size={20} color={theme.color?.get()} />
                <Text color="$gray10">Nenhum mecânico encontrado</Text>
              </XStack>
            ) : (
              <YStack space="$2">
                {workload.map((m) => (
                  <Card
                    key={m.id}
                    bordered
                    padding="$3"
                    pressStyle={{ scale: 0.99 }}
                    onPress={() =>
                      Alert.alert('Em desenvolvimento', `Workload de ${m.mechanicName}`)
                    }
                  >
                    <YStack space="$2">
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                        space="$2"
                      >
                        <YStack flex={1}>
                          <Text fontWeight="bold" fontSize="$5">
                            {m.mechanicName}
                          </Text>
                          <Text color="$gray11" fontSize="$3">
                            Veículos em reparação: {m.activeOrders}
                          </Text>
                        </YStack>

                        <Card
                          backgroundColor="$orange4"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$3"
                        >
                          <Text color="$orange11" fontSize="$2" fontWeight="600">
                            {m.activeOrders}
                          </Text>
                        </Card>
                      </XStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            )}
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
