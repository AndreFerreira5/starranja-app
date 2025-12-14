import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { 
  LayoutDashboard, 
  Calendar, 
  ListTodo, 
  Package, 
  Users 
} from 'lucide-react-native';
import { useTheme } from 'tamagui';
import { useTokenRefresh } from '@/api/useTokenRefresh';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  const iconColor = theme.color?.get() || (colorScheme === 'dark' ? '#fff' : '#000');
  const activeIconColor = theme.orange?.get() || 'orange';
  
  useTokenRefresh();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        tabBarStyle: {
          backgroundColor: theme.background?.get(),
          borderTopColor: theme.borderColor?.get(),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tarefas"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, focused }) => (
            <ListTodo size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="encomendas"
        options={{
          title: 'Encomendas',
          tabBarIcon: ({ color, focused }) => (
            <Package size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, focused }) => (
            <Users size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
