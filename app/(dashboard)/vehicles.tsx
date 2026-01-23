import { useEffect, useState } from 'react';
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

type VehicleStatus = 'diagnosing' | 'executing' | 'finished';

type Vehicle = {
  id: string;
  vehicleName: string;
  plate: string;
  ownerName: string;
  mechanicName: string;
  status: VehicleStatus;
};

const statusLabel: Record<VehicleStatus, string> = {
  diagnosing: 'Em Diagnóstico',
  executing: 'Em Execução',
  finished: 'Concluído',
};

export default function VehiclesPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Mock data (sem backend)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      const mock: Vehicle[] = [
        {
          id: '1',
          vehicleName: 'Renault Clio',
          plate: '12-AB-34',
          ownerName: 'João Silva',
          mechanicName: 'Carlos Pereira',
          status: 'diagnosing',
        },
        {
          id: '2',
          vehicleName: 'Peugeot 208',
          plate: '45-CD-67',
          ownerName: 'Ana Costa',
          mechanicName: 'Rui Almeida',
          status: 'executing',
        },
        {
          id: '3',
          vehicleName: 'VW Golf',
          plate: '89-EF-10',
          ownerName: 'Miguel Santos',
          mechanicName: 'Carlos Pereira',
          status: 'finished',
        },
        {
          id: '4',
          vehicleName: 'Toyota Yaris',
          plate: '11-GH-22',
          ownerName: 'Sofia Martins',
          mechanicName: 'Inês Rocha',
          status: 'executing',
        },
      ];

      setVehicles(mock);
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
      Alert.alert('Erro', error?.message || 'Não foi possível carregar os veículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const totalInWorkshop = vehicles.length;

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        <H1>Veículos</H1>

        <Card elevate padded>
          <YStack space="$2">
            <H3>Total de veículos hoje:</H3>
            <Separator />
            <Text fontSize="$8" fontWeight="800" color="$gray12">
              {loading ? '—' : totalInWorkshop}
            </Text>
          </YStack>
        </Card>

        <Card elevate padded>
          <YStack space="$3">
            <H3>Veículos na Oficina</H3>
            <Separator />

            {loading ? (
              <XStack justifyContent="center" padding="$4">
                <Spinner size="large" />
            </XStack>
            ) : vehicles.length === 0 ? (
              <XStack justifyContent="center" alignItems="center" space="$2" padding="$4">
                <AlertCircle size={20} color={theme.color?.get()} />
                <Text color="$gray10">Nenhum veículo encontrado</Text>
              </XStack>
            ) : (
              <YStack space="$2">
                {vehicles.map((v) => (
                  <Card
                    key={v.id}
                    bordered
                    padding="$3"
                    pressStyle={{ scale: 0.99 }}
                    onPress={() =>
                      Alert.alert('Em desenvolvimento', `Detalhes de ${v.plate}`)
                    }
                  >
                    <YStack space="$2">
                      <XStack justifyContent="space-between" alignItems="center" space="$2">
                        <YStack flex={1}>
                          <Text fontWeight="bold" fontSize="$5">
                            {v.vehicleName}
                          </Text>
                          <Text color="$gray11" fontSize="$3">
                            Matrícula: {v.plate}
                          </Text>
                          <Text color="$gray11" fontSize="$3">
                            Dono: {v.ownerName}
                          </Text>
                          <Text color="$gray11" fontSize="$3">
                            Mecânico: {v.mechanicName}
                          </Text>
                        </YStack>

                        <Card
                          backgroundColor="$orange4"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$3"
                        >
                          <Text color="$orange11" fontSize="$2" fontWeight="600">
                            {statusLabel[v.status]}
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
