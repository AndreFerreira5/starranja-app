import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import {
  Button,
  YStack,
  Text,
  ScrollView,
  XStack,
  Separator,
  H1,
  H3,
  H4,
  H5,
} from 'tamagui';
import { router } from 'expo-router';

type Role = 'mechanic' | 'mechanic_manager' | 'manager' | 'admin' | null;
type User = { name?: string; role?: Role } | null;
type DashboardStats = {
  vehiclesInService?: number;
  workloadOccupied?: number;
  bookingsThisWeek?: number;
  pendingParts?: number;
  billingMonth?: string | number;
  alertsCount?: number;
  stateCounts?: {
    diagnosing?: number;
    executing?: number;
    finished?: number;
  };
};

const StatCard = ({title, content, clickable = false, onPressRoute,}: {title: string; content: string | number | undefined; clickable?: boolean; onPressRoute?: string;}) => {
  const CardContent = (
    <YStack
      backgroundColor="$gray4"
      padding="$4"
      borderRadius="$5"
      gap="$1"
      flex={1}
      minWidth={160}
      alignItems="center"
      justifyContent="center"
      minHeight={100}
      elevation="$2"
    >
      <H5 fontWeight="bold" color="$gray11" textAlign="center">
        {title}
      </H5>
      <H4 color="$gray12">{content ?? '—'}</H4>
    </YStack>
  );

  if (clickable) {
    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.7}
        onPress={() => {
          if (onPressRoute) {
            router.replace(onPressRoute);
          } else {
            Alert.alert('Em desenvolvimento');
          }
        }}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const StateBox = ({ title, count }: { title: string; count?: number }) => (
  <YStack flex={1} alignItems="center" gap="$2">
    <Text fontWeight="bold" fontSize="$3" color="$gray11" textAlign="center">
      {title}
    </Text>
    <YStack
      backgroundColor="$gray5"
      paddingVertical="$2"
      paddingHorizontal="$4"
      borderRadius="$3"
    >
      <H5 color="$gray12">{typeof count === 'number' ? count : '—'}</H5>
    </YStack>
  </YStack>
);

const ManagerAdminDashboard = ({clickable, stats,}: {clickable: boolean;stats?: DashboardStats;}) => (
  <YStack width="100%" maxWidth={500} gap="$4" paddingBottom="$4">
    <H1 textAlign="center" marginVertical="$3">
      Dashboard
    </H1>

    {/* Quando o backend for implementado, carregue os valores para cada stat card e statbox */}
    <XStack gap="$2">
      <StatCard
        title="Veículos em Serviço"
        content={stats?.vehiclesInService}
        clickable={clickable}
        onPressRoute="/(dashboard)/vehicles"
      />

      <StatCard
        title="Carga de Trabalho"
        content={stats?.workloadOccupied}
        clickable={clickable}
        onPressRoute="/(dashboard)/workload"
      />
    </XStack>

    <XStack gap="$2">
      <StatCard
        title="Marcações da Semana"
        content={stats?.bookingsThisWeek}
        clickable={clickable}
        onPressRoute="/(dashboard)/bookings"
      />
      <StatCard
        title="Peças Pendentes"
        content={stats?.pendingParts}
        clickable={clickable}
        onPressRoute="/(dashboard)/deliveries"
      />
    </XStack>

    <XStack gap="$2">
      <StatCard
        title="Faturação do Mês"
        content={stats?.billingMonth}
        clickable={clickable}
        onPressRoute="/(dashboard)/billing"
      />
      <StatCard
        title="Alertas"
        content={stats?.alertsCount}
        clickable={clickable}
        onPressRoute="/(dashboard)/alerts"
      />
    </XStack>

    <Separator marginVertical="$4" />

    <YStack gap="$2" width="100%">
      <H3 textAlign="center" color="$gray11">
        Veículos Ativos Por Estado
      </H3>
      <XStack gap="$2" justifyContent="space-between" paddingHorizontal="$3">
        <StateBox title="Em Diagnóstico" count={stats?.stateCounts?.diagnosing} />
        <StateBox title="Em Execução" count={stats?.stateCounts?.executing} />
        <StateBox title="Concluídos" count={stats?.stateCounts?.finished} />
      </XStack>
    </YStack>
    {/* Adicionar navigation bar*/}
  </YStack>
);

const MechanicWelcome = ({ name }: { name?: string }) => (
  <YStack
    flex={1}
    justifyContent="center"
    alignItems="center"
    gap="$4"
    paddingVertical={100}
  >
    <H3 color="$gray12">Bem-vindo{name ? `, ${name}` : ''}!</H3>
    {/* Adicionar navigation bar*/}
  </YStack>
);

// --- Componente Principal da Página ---
const IndexPage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>({ name: 'Admin', role: 'admin' });
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);

  useEffect(() => {
    try {
      // Carregar dados do utilizador quando o backend for implementado.
    } catch (error: any) {
      Alert.alert('Erro', error.message);
      router.replace('/(auth)/sign-in');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Move the redirect into useEffect
  //useEffect(() => {
  //  if (!loading && !user) {
  //    router.replace('/(auth)/sign-in');
  //  }
  //}, [loading, user]);

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
        <Text marginTop={16}>A carregar...</Text>
      </YStack>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const logout = () => {
    try {
      // Tratar do logout  quando o backend for implementado.
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const canClick = user?.role === 'manager' || user?.role === 'admin';

  return (
    <ScrollView>
      <YStack flex={1} alignItems="center" padding="$4" gap="$4" paddingTop="$6">
        {canClick ? (
          <ManagerAdminDashboard clickable={true} stats={stats} />
        ) : (
          <MechanicWelcome name={user?.name} />
        )}

        <Button
          size="$4"
          width="100%"
          maxWidth={400}
          onPress={logout}
          backgroundColor="orange"
          marginTop="$4"
        >
          <Text>Sair</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
};

export default IndexPage;