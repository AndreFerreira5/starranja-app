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
  SizableText,
  Tag,
  Input,
} from 'tamagui';
import { Modal } from '@tamagui/modal';
import {
  ArrowLeft,
  Wrench,
  Plus,
  CheckCircle,
} from '@tamagui/lucide-icons';


type ItemServico = {
  nome: string;
  custo: number;
  isMaoDeObra?: boolean;
};


type Tarefa = {
  id: string;
  numero: number;
  titulo: string;

  cliente: string;
  modeloVeiculo: string;
  matricula: string;

  mecanicoNome: string;
  mecanicoEstado: 'Ativo' | 'Inativo';
  descricao: string;
  estado: 'Pendente' | 'Em Execução' | 'Concluída';
  itensServico: ItemServico[];
};


const FolhaObraDetalhe = ({
  tarefa: initialTarefa,
  onClose,
}: {
  tarefa: Tarefa;
  onClose: () => void;
}) => {
  const [tarefa, setTarefa] = useState(initialTarefa);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const pecas = tarefa.itensServico.filter(item => !item.isMaoDeObra);
  const maoDeObra = tarefa.itensServico.find(item => item.isMaoDeObra);

  const custoPecas = pecas.reduce((acc, item) => acc + item.custo, 0);
  const custoMaoDeObra = maoDeObra ? maoDeObra.custo : 0;
  const custoTotal = custoPecas + custoMaoDeObra;

  const handleAdicionarItem = () => {
    if (!newItemName || !newItemCost || isNaN(Number(newItemCost))) {
      Alert.alert('Erro', 'Por favor, preencha o nome e o custo (numérico) do item.');
      return;
    }
    const novoItem: ItemServico = {
      nome: newItemName,
      custo: Number(newItemCost),
      isMaoDeObra: false,
    };

    setTarefa({
      ...tarefa,
      itensServico: [...tarefa.itensServico, novoItem],
    });

    setNewItemName('');
    setNewItemCost('');
    setIsModalOpen(false);
    Alert.alert('Sucesso', `Item "${newItemName}" (custo: ${novoItem.custo.toFixed(2)}€) adicionado à Folha de Obra.`);
  };

  const handleUpdateEstado = (novoEstado: Tarefa['estado']) => {
    setTarefa({ ...tarefa, estado: novoEstado });
    Alert.alert('Estado Atualizado', `O estado da tarefa foi alterado para: ${novoEstado}`);
  };

  const mecanicoColor =
    tarefa.mecanicoEstado === 'Ativo' ? '$green8' : '$red8';

  return (
    <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 50 }}>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} animation="quick">
        <YStack padding="$4" backgroundColor="$background" borderRadius="$8" gap="$4">
          <H4>Adicionar Peça/Serviço</H4>
          <Input
            placeholder="Nome do Item (Ex: Filtro de Ar)"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <Input
            placeholder="Custo (Ex: 15.50)"
            keyboardType="numeric"
            value={newItemCost}
            onChangeText={setNewItemCost}
          />
          <Button onPress={handleAdicionarItem} icon={Plus} theme="green">
            Adicionar à Lista
          </Button>
          <Button onPress={() => setIsModalOpen(false)} theme="red">
            Cancelar
          </Button>
        </YStack>
      </Modal>

      <YStack flex={1} padding="$4" gap="$4" width="100%">
        <Button
          size="$3"
          onPress={onClose}
          icon={ArrowLeft}
          alignSelf="flex-start"
          backgroundColor="$gray4"
          color="$gray12"
        >
          Voltar às Tarefas
        </Button>

        <YStack
          backgroundColor="$gray4"
          padding="$5"
          borderRadius="$8"
          gap="$4"
          elevation="$3"
          width="100%"
          alignItems="flex-start"
        >
          <H4 fontWeight="bold" color="$gray12" textAlign="center" width="100%">
            Folha de Obra ID-{tarefa.numero}
          </H4>
          <Separator width="100%" />

          <YStack gap="$1" paddingLeft="$2">
            <Text color="$gray11">
              <Text fontWeight="bold" color="$gray12">Matrícula:</Text>{' '}
              {tarefa.matricula}
            </Text>
            <Text color="$gray11">
              <Text fontWeight="bold" color="$gray12">Modelo:</Text>{' '}
              {tarefa.modeloVeiculo}
            </Text>
            <Text color="$gray11">
              <Text fontWeight="bold" color="$gray12">Cliente:</Text>{' '}
              {tarefa.cliente}
            </Text>
          </YStack>

          <Separator width="100%" />

          <H5 fontWeight="bold" color="$gray12">
            Descrição - {tarefa.titulo}
          </H5>
          <SizableText color="$gray11" fontSize="$3">
            {tarefa.descricao}
          </SizableText>

          <Separator width="100%" />

          <H5 fontWeight="bold" color="$gray12">
            Peças e Mão de Obra:
          </H5>

          <YStack width="100%" gap="$2">
            {[...pecas, maoDeObra].filter(Boolean).map((item, index) => (
              <XStack
                key={`item-${index}`}
                justifyContent="space-between"
                backgroundColor="$gray5"
                padding="$2.5"
                borderRadius="$4"
                alignItems="center"
              >
                <Text color="$gray12" fontWeight="500">
                  {item!.nome}
                </Text>
                <Text color="$gray12" fontWeight="bold">
                  {item!.custo.toFixed(2)}€
                </Text>
              </XStack>
            ))}

            <Button
              size="$3"
              onPress={() => setIsModalOpen(true)}
              icon={Plus}
              theme="gray"
              backgroundColor="$gray6"
              color="$gray12"
              alignSelf="flex-start"
            >
              Adicionar +
            </Button>
          </YStack>

          <Separator width="100%" />

          <XStack justifyContent="space-between" width="100%" paddingVertical="$2">
            <H4 fontWeight="bold" color="$gray12">
              Custo Total:
            </H4>
            <H4 fontWeight="bold" color="$blue10">
              {custoTotal.toFixed(2)}€
            </H4>
          </XStack>

          <Separator width="100%" />

          <XStack alignItems="center" gap="$3">
            <H5 fontWeight="bold" color="$gray12">
              Mecânico:
            </H5>
            <Tag
              backgroundColor={mecanicoColor}
              borderRadius="$10"
              paddingHorizontal="$3"
              paddingVertical="$2"
              icon={Wrench}
            >
              <Text color="$white" fontWeight="bold">
                {tarefa.mecanicoNome} - {tarefa.mecanicoEstado}
              </Text>
            </Tag>
          </XStack>

          <Separator width="100%" />

          <XStack justifyContent="space-between" width="100%" marginTop="$2">
            <Button
              size="$4"
              onPress={() => handleUpdateEstado('Em Execução')}
              disabled={tarefa.estado === 'Em Execução' || tarefa.estado === 'Concluída'}
              backgroundColor={tarefa.estado === 'Em Execução' ? '$blue5' : '$blue9'}
              color="$white"
            >
              Em Execução
            </Button>
            <Button
              size="$4"
              onPress={() => handleUpdateEstado('Concluída')}
              disabled={tarefa.estado === 'Concluída'}
              backgroundColor={tarefa.estado === 'Concluída' ? '$green5' : '$green9'}
              color="$white"
              icon={CheckCircle}
            >
              Concluir
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
};


const TarefaItem = ({
  tarefa,
  onOpen,
}: {
  tarefa: Tarefa;
  onOpen: (tarefa: Tarefa) => void;
}) => {
  const handleOpenFolhaObra = () => {
    onOpen(tarefa);
  };

  return (
    <YStack
      backgroundColor="$gray4"
      padding="$4"
      borderRadius="$5"
      gap="$3"
      elevation="$2"
      width="100%"
      alignItems="flex-start"
      marginVertical="$2"
    >
      <H4 fontWeight="bold" color="$gray12" marginBottom="$2">
        #{tarefa.numero} - {tarefa.titulo}
      </H4>

      <Button
        size="$3"
        onPress={handleOpenFolhaObra}
        backgroundColor="$blue7"
        paddingHorizontal="$4"
        borderRadius="$5"
      >
        <Text color="$gray1" fontWeight="bold">
          Abrir Folha de Obra
        </Text>
      </Button>
    </YStack>
  );
};


export default function TarefasPage() {
  // NOVO ESTADO: Simula o nome do mecânico autenticado.
  // Em produção, este valor viria de um contexto ou estado global de autenticação.
  const [currentMecanico] = useState('José Manuel'); 

  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);

  const fetchTarefas = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // --- MOCK DATA (Simulação de todas as tarefas da oficina) ---
      const allMockData: Tarefa[] = [
        {
          id: 'wo-001',
          numero: 179,
          titulo: 'Revisão geral ao veículo',
          cliente: 'Carlos Ferreira',
          modeloVeiculo: 'Volkswagen Golf 1.6',
          matricula: '45-AA-32',
          mecanicoNome: 'José Manuel', // Esta tarefa é do José Manuel
          mecanicoEstado: 'Ativo',
          estado: 'Em Execução',
          descricao:
            'Verificação geral de segurança, mudança de óleo e filtro, ver os níveis de óleo e água dos vidros.',
          itensServico: [
            { nome: 'Óleo de Motor (5L)', custo: 40.0, isMaoDeObra: false },
            { nome: 'Filtro de Óleo', custo: 12.5, isMaoDeObra: false },
            { nome: 'Mão de Obra (1.5h)', custo: 55.0, isMaoDeObra: true },
          ],
        },
        {
          id: 'wo-002',
          numero: 2,
          titulo: 'Reparação de motor',
          cliente: 'Maria Pires',
          modeloVeiculo: 'Renault Clio 1.2',
          matricula: 'FG-34-HI',
          mecanicoNome: 'Ana Barbosa', // Esta tarefa é da Ana Barbosa
          mecanicoEstado: 'Inativo',
          estado: 'Pendente',
          descricao:
            'Diagnóstico de ruído estranho no motor. Suspeita de correia de distribuição danificada. Cliente aguarda orçamento.',
          itensServico: [
            { nome: 'Mão de Obra (2h - Diagnóstico)', custo: 80.0, isMaoDeObra: true },
          ],
        },
         {
          id: 'wo-003',
          numero: 3,
          titulo: 'Substituição de Pneus',
          cliente: 'António Gomes',
          modeloVeiculo: 'Audi A4',
          matricula: 'JK-56-LM',
          mecanicoNome: 'José Manuel', // Esta tarefa também é do José Manuel
          mecanicoEstado: 'Ativo',
          estado: 'Pendente',
          descricao: 'Montagem e calibragem de 4 pneus novos.',
          itensServico: [
            { nome: 'Pneus (x4)', custo: 240.0, isMaoDeObra: false },
            { nome: 'Mão de Obra (1h)', custo: 40.0, isMaoDeObra: true },
          ],
        },
      ];
      // -----------------------------------------------------------------

      // --- LÓGICA DE FILTRAGEM ---
      // Filtra as tarefas para que apenas as atribuídas ao mecânico atual sejam mostradas.
      const tarefasMecanico = allMockData.filter(
        tarefa => tarefa.mecanicoNome === currentMecanico
      );
      
      // Em um ambiente de endpoint real (fetch/axios), o filtro seria idealmente feito no backend
      // (Ex: GET /api/tarefas?mecanico=José Manuel) para otimização.

      setTarefas(tarefasMecanico);

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
  }, [currentMecanico]); // Re-executar se o mecânico autenticado mudar

  const handleSelectTarefa = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
  };

  const handleCloseDetalhe = () => {
    setSelectedTarefa(null);
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <ActivityIndicator size="large" />
        <Text marginTop={16}>A carregar tarefas...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        gap="$4"
      >
        <Text color="$red10" fontWeight="bold">
          {error}
        </Text>
        <Button onPress={fetchTarefas}>
          <Text>Tentar Novamente</Text>
        </Button>
      </YStack>
    );
  }

  if (selectedTarefa) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        margin="$4"
        borderRadius="$8"
        paddingHorizontal="$2"
        paddingVertical="$2"
        elevation="$5"
        maxWidth={500}
        alignSelf="center"
      >
        <FolhaObraDetalhe
          tarefa={selectedTarefa}
          onClose={handleCloseDetalhe}
        />
      </YStack>
    );
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack
        flex={1}
        padding="$4"
        gap="$4"
        alignItems="center"
        backgroundColor="$gray2"
        margin="$4"
        borderRadius="$8"
        paddingHorizontal="$6"
        paddingVertical="$6"
        elevation="$5"
        maxWidth={500}
        alignSelf="center"
      >
        <H1
          color="$gray12"
          textAlign="center"
          marginBottom="$4"
          marginTop="$2"
        >
          Tarefas Atribuídas para {currentMecanico}
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
            tarefas.map(tarefa => (
              <TarefaItem
                key={tarefa.id}
                tarefa={tarefa}
                onOpen={handleSelectTarefa}
              />
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
