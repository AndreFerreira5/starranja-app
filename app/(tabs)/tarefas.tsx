import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import {
  YStack,
  H1,
  Text,
  ScrollView,
  Separator,
  Button,
  XStack,
  H4,
  H5,
} from 'tamagui';
import { router } from 'expo-router';

// --- Tipos de Dados ---
// Definição da estrutura de dados para uma tarefa
type Tarefa = {
  id: string; // Ex: ID da folha de obra
  numero: number; // Ex: #1, #2, etc.
  titulo: string; // Ex: Manutenção de veículo
  // Outros dados relevantes (Ex: veiculo, cliente, estado) podem ser adicionados aqui
};

// --- Componente de Item da Tarefa ---
const TarefaItem = ({ tarefa }: { tarefa: Tarefa }) => {
  // Simular a navegação para a Folha de Obra
  const handleOpenFolhaObra = () => {
    // Alerta de desenvolvimento ou navegação real
    Alert.alert(
      'Abrir Folha de Obra',
      `A navegar para a folha de obra #${tarefa.numero}: ${tarefa.titulo}`
    );
    // Exemplo de navegação real se a rota for dinâmica:
    // router.push(`/work-order/${tarefa.id}`);
  };

  return (
    // O TouchableOpacity simula a área clicável do item
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleOpenFolhaObra}
      style={{ width: '100%' }}
    >
      <YStack
        backgroundColor="$gray4" // Fundo do item
        padding="$4"
        borderRadius="$5"
        gap="$3"
        elevation="$2"
        width="100%"
        alignItems="flex-start" // Alinha o texto à esquerda
        // Ajuste a margem vertical para separar os itens
        marginVertical="$2" 
      >
        <H4 fontWeight="bold" color="$gray12" marginBottom="$2">
          #{tarefa.numero} - {tarefa.titulo}
        </H4>
        
        {/* Botão de "Abrir Folha de Obra" dentro do item */}
        <Button
          size="$3"
          // O onPress no botão também deve navegar
          onPress={handleOpenFolhaObra}
          backgroundColor="$gray6" // Cor de fundo semelhante à imagem
          paddingHorizontal="$4"
          borderRadius="$5"
        >
          <Text color="$gray11" fontWeight="bold">Abrir Folha de Obra</Text>
        </Button>
      </YStack>
    </TouchableOpacity>
  );
};

// --- Componente Principal da Página ---
export default function TarefasPage() {
  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados do backend
  const fetchTarefas = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- Simulação de Chamada ao Backend ---
      // Substitua isto pela sua chamada fetch/axios real ao endpoint
      // Ex: const response = await fetch('/api/mechanic/tasks');
      // Ex: const data = await response.json();
      
      // Simulação de delay e dados de resposta do backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: Tarefa[] = [
        { id: 'wo-001', numero: 1, titulo: 'Manutenção de veículo' },
        { id: 'wo-002', numero: 2, titulo: 'Reparação de motor' },
        { id: 'wo-003', numero: 3, titulo: 'Instalação de peças e acessórios' },
        { id: 'wo-004', numero: 4, titulo: 'Substituição de pneus' },
        { id: 'wo-005', numero: 5, titulo: 'Diagnóstico elétrico' },
      ];

      setTarefas(mockData);

    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err);
      setError('Não foi possível carregar as tarefas. Tente novamente.');
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, []);

  // Conteúdo de Carregamento
  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <ActivityIndicator size="large" />
        <Text marginTop={16}>A carregar tarefas...</Text>
      </YStack>
    );
  }

  // Conteúdo de Erro
  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <Text color="$red10" fontWeight="bold">{error}</Text>
        <Button onPress={fetchTarefas}>
          <Text>Tentar Novamente</Text>
        </Button>
      </YStack>
    );
  }

  // Conteúdo Principal
  return (
    <ScrollView 
        flex={1} 
        backgroundColor="$background" // Para cobrir o fundo
    >
      <YStack 
        flex={1} 
        padding="$4" 
        gap="$4" 
        alignItems="center"
        // Estilização do bloco principal de lista (semelhante à imagem)
        backgroundColor="$gray2" // Fundo do bloco da lista
        margin="$4"
        borderRadius="$8" // Cantos arredondados
        paddingHorizontal="$6"
        paddingVertical="$6"
        elevation="$5" // Sombra
        maxWidth={500} // Limite de largura para tablets/desktop
        alignSelf="center" // Centraliza o bloco na horizontal
      >
        <H1 
          color="$gray12" // Cor do título principal
          textAlign="center"
          marginBottom="$4"
          marginTop="$2"
        >
          Tarefas Atribuídas
        </H1>

        <H4 
            color="$gray11" 
            fontWeight="bold" 
            alignSelf="flex-start" 
            marginBottom="$2"
        >
            Lista de Tarefas
        </H4>

        <Separator />
        
        <YStack gap="$2" width="100%">
          {tarefas.length > 0 ? (
            tarefas.map((tarefa) => (
              <TarefaItem key={tarefa.id} tarefa={tarefa} />
            ))
          ) : (
            <Text textAlign="center" color="$gray9">
              Nenhuma tarefa atribuída no momento.
            </Text>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}