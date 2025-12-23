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
  View,
} from 'tamagui';
import { router } from 'expo-router';

// --- Tipos ---
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

// --- Sub-componentes do Dashboard ---
const StatCard = ({
  title,
  content,
  clickable = false,
  onPressRoute,
}: {
  title: string;
  content: string | number | undefined;
  clickable?: boolean;
  onPressRoute?: string;
}) => {
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

// --- Dashboard para Manager e Admin ---
const ManagerAdminDashboard = ({
  clickable,
  stats,
  isAdmin,
}: {
  clickable: boolean;
  stats?: DashboardStats;
  isAdmin: boolean;
}) => (
  <YStack width="100%" maxWidth={500} gap="$4" paddingBottom="$4">
    <H1 textAlign="center" marginVertical="$3" color="$gray12">
      Dashboard
    </H1>

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

    {/* 🔐 Botão visível APENAS para o Role 'admin' */}
    {isAdmin && (
      <YStack width="100%" marginTop="$6">
        <Separator marginBottom="$6" />
        <Button
          size="$4"
          width="100%"
          backgroundColor="$blue10"
          onPress={() => router.push('/configuracoes')}
        >
          <Text color="white" fontWeight="bold">Configurações de Administrador</Text>
        </Button>
        <Text textAlign="center" fontSize="$2" color="$gray10" marginTop="$2">
          Área restrita a administradores
        </Text>
      </YStack>
    )}
  </YStack>
);

// --- Ecrã de Boas-vindas para Mecânicos ---
const MechanicWelcome = ({ name }: { name?: string }) => (
  <YStack
    flex={1}
    justifyContent="center"
    alignItems="center"
    gap="$4"
    paddingVertical={100}
  >
    <H3 color="$gray12" textAlign="center">
      Bem-vindo{name ? `, ${name}` : ''}!
    </H3>
    <Text color="$gray11">Bom trabalho para hoje.</Text>
  </YStack>
);

// --- Componente Principal ---
export default function IndexPage() {
  const [loading, setLoading] = useState(true);
  
  // Simulação de utilizador. Altera 'admin' para 'mechanic' para testar os dois cenários.
  const [user, setUser] = useState<User>({
    name: 'Admin User',
    role: 'admin', 
  });
  
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);

  useEffect(() => {
    // Simulação de carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="$orange10" />
        <Text marginTop={16} color="$gray11">A carregar dashboard...</Text>
      </YStack>
    );
  }

  if (!user) return null;

  // Lógicas de Permissão
  const isManagerOrAdmin = user.role === 'manager' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

  return (
    <ScrollView backgroundColor="$background">
      <YStack flex={1} alignItems="center" padding="$4" gap="$4" paddingTop="$6">
        
        {/* Renderização Condicional do Conteúdo Central */}
        {isManagerOrAdmin ? (
          <ManagerAdminDashboard
            clickable={true}
            stats={stats}
            isAdmin={isAdmin}
          />
        ) : (
          <MechanicWelcome name={user.name} />
        )}

        {/* Botão de Logout Comum a todos */}
        <Button
          size="$4"
          width="100%"
          maxWidth={400}
          onPress={() => router.replace('/(auth)/sign-in')}
          backgroundColor="orange"
          marginTop="$8"
          marginBottom="$4"
        >
          <Text color="white" fontWeight="bold">Sair da Conta</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}