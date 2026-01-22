import { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  H1,
  H3,
  Text,
  Button,
  Input,
  Label,
  Card,
  Separator,
  ScrollView,
  Spinner,
  useTheme,
} from 'tamagui';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  User,
  FileText,
  X,
} from 'lucide-react-native';
import { Alert, Keyboard } from 'react-native';

interface Marcacao {
  id: string;
  cliente: string;
  descricao: string;
  data: string;
  hora: string;
}


const CURRENT_USER_ROLE = 'gerente'; 

export default function CalendarioPage() {
  const theme = useTheme();
  
  // --- Estados ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar a visibilidade do formulário (Modal Manual)
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    descricao: '',
    data: '', 
    hora: ''
  });

  // --- Efeitos ---
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
    
    setFormData(prev => ({
      ...prev,
      data: today.toISOString().split('T')[0]
    }));
  }, []);

  const fetchMarcacoes = async (date: Date) => {
    setLoading(true);
    try {
      // Simulação de Backend
      setTimeout(() => {
        setMarcacoes([
          {
            id: '1',
            cliente: 'Sr. Alberto',
            descricao: 'Mudança de Óleo e Filtros',
            data: date.toISOString(),
            hora: '09:00'
          },
          {
            id: '2',
            cliente: 'Dona Maria',
            descricao: 'Revisão Geral e Travões',
            data: date.toISOString(),
            hora: '14:30'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcacoes(selectedDate);
    
    setFormData(prev => ({
      ...prev,
      data: selectedDate.toISOString().split('T')[0]
    }));
  }, [selectedDate]);

  // --- Handlers ---

  const handleCreateMarcacao = async () => {
    if (!formData.cliente || !formData.descricao || !formData.data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    Keyboard.dismiss(); // Fecha o teclado

    try {
      // Simulação de envio
      setTimeout(() => {
        Alert.alert('Sucesso', 'Marcação criada com sucesso!');
        setIsFormOpen(false); // Fecha o formulário
        setFormData({ cliente: '', descricao: '', data: formData.data, hora: '' });
        fetchMarcacoes(selectedDate); 
        setSubmitting(false);
      }, 1000);

    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao criar marcação');
      setSubmitting(false);
    }
  };

  const getDayName = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <YStack flex={1} backgroundColor="$background" position="relative">
      
      {/* --- Conteúdo Principal --- */}
      <YStack flex={1} opacity={isFormOpen ? 0.3 : 1}> 
        {/* Diminui a opacidade do fundo quando o form está aberto */}
        
        <YStack padding="$4" paddingBottom="$2">
          <H1>Calendário</H1>
          <Text color="$gray10" fontSize="$4">
            {selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </Text>
        </YStack>

        {/* Barra de Dias */}
        <YStack>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
          >
            <XStack space="$3">
              {weekDates.map((date, index) => {
                const active = isSelected(date);
                return (
                  <Card
                    key={index}
                    width={60}
                    height={80}
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor={active ? '$orange9' : '$gray2'}
                    pressStyle={{ scale: 0.95 }}
                    onPress={() => !isFormOpen && setSelectedDate(date)} // Bloqueia clique se form aberto
                    borderRadius="$4"
                    borderWidth={active ? 0 : 1}
                    borderColor="$gray5"
                  >
                    <Text 
                      color={active ? 'white' : '$gray11'} 
                      fontSize="$3" 
                      fontWeight="600"
                      textTransform="uppercase"
                    >
                      {getDayName(date)}
                    </Text>
                    <H3 color={active ? 'white' : '$color'} marginTop="$1">
                      {getDayNumber(date)}
                    </H3>
                    {date.toDateString() === new Date().toDateString() && (
                       <YStack 
                         width={6} 
                         height={6} 
                         borderRadius={3} 
                         backgroundColor={active ? 'white' : '$orange9'} 
                         marginTop="$1"
                       />
                    )}
                  </Card>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        <Separator marginVertical="$2" />

        {/* Lista de Marcações */}
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <H3>Marcações do Dia</H3>
            <Text color="$gray10">{marcacoes.length} agendadas</Text>
          </XStack>

          {loading ? (
            <YStack padding="$10" alignItems="center">
              <Spinner size="large" color="$orange9" />
            </YStack>
          ) : marcacoes.length === 0 ? (
            <YStack 
              padding="$8" 
              alignItems="center" 
              backgroundColor="$gray2" 
              borderRadius="$4"
              borderStyle="dashed"
              borderWidth={1}
              borderColor="$gray8"
            >
              <CalendarIcon size={40} color={theme.gray8?.get()} />
              <Text color="$gray10" marginTop="$2" textAlign="center">
                Sem marcações para este dia.
              </Text>
            </YStack>
          ) : (
            <YStack space="$3">
              {marcacoes.map((item) => (
                <Card key={item.id} elevate bordered padding="$3" backgroundColor="white">
                  <XStack space="$3">
                    <YStack 
                      alignItems="center" 
                      justifyContent="center" 
                      paddingRight="$3" 
                      borderRightWidth={1} 
                      borderColor="$gray4"
                    >
                      <H3 color="$orange9">{item.hora}</H3>
                      <Clock size={16} color={theme.gray10?.get()} />
                    </YStack>

                    <YStack flex={1} space="$1">
                      <XStack alignItems="center" space="$2">
                        <User size={16} color="black" />
                        <Text fontWeight="bold" fontSize="$4">{item.cliente}</Text>
                      </XStack>
                      
                      <XStack alignItems="center" space="$2" marginTop="$1">
                        <FileText size={16} color={theme.gray10?.get()} />
                        <Text color="$gray11" fontSize="$3">{item.descricao}</Text>
                      </XStack>
                    </YStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>

      {/* --- Botão Flutuante (Apenas Gerente e se Form fechado) --- */}
      {CURRENT_USER_ROLE === 'gerente' && !isFormOpen && (
        <YStack 
          position="absolute" 
          bottom="$4" 
          right="$4" 
          left="$4"
        >
          <Button 
            theme="orange" 
            size="$5" 
            icon={<Plus />} 
            elevate
            onPress={() => setIsFormOpen(true)}
            fontWeight="bold"
          >
            Nova Marcação
          </Button>
        </YStack>
      )}

      {/* --- Overlay / Modal Manual --- */}
      {isFormOpen && (
        <YStack 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          justifyContent="center" 
          alignItems="center"
          zIndex={1000}
        >
          {/* Fundo escuro clicável para fechar */}
          <YStack 
            position="absolute" 
            top={0} left={0} right={0} bottom={0} 
            backgroundColor="black" 
            opacity={0.5}
            onPress={() => setIsFormOpen(false)}
          />

          {/* O Cartão do Formulário */}
          <Card 
            width="90%" 
            backgroundColor="$background" 
            padding="$4" 
            borderRadius="$6" 
            elevate
            bordered
          >
            <YStack space="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <H3>Criar Marcação</H3>
                <Button 
                  size="$3" 
                  circular 
                  chromeless 
                  icon={<X size={20} />} 
                  onPress={() => setIsFormOpen(false)} 
                />
              </XStack>
              
              <Separator />

              {/* Form Fields */}
              <YStack space="$2">
                <Label htmlFor="cliente">Nome do Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Ex: João Silva"
                  value={formData.cliente}
                  onChangeText={t => setFormData({...formData, cliente: t})}
                />
              </YStack>

              <YStack space="$2">
                <Label htmlFor="descricao">Descrição do Serviço</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Mudança de pneus"
                  value={formData.descricao}
                  onChangeText={t => setFormData({...formData, descricao: t})}
                />
              </YStack>

              <XStack space="$3">
                  <YStack flex={1} space="$2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                      id="data"
                      value={formData.data} 
                      onChangeText={t => setFormData({...formData, data: t})}
                      keyboardType="numeric"
                  />
                  </YStack>
                  <YStack flex={1} space="$2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                      id="hora"
                      placeholder="09:00"
                      value={formData.hora}
                      onChangeText={t => setFormData({...formData, hora: t})}
                  />
                  </YStack>
              </XStack>

              <Button 
                theme="orange" 
                marginTop="$4" 
                onPress={handleCreateMarcacao}
                disabled={submitting}
                icon={submitting ? <Spinner color="white"/> : undefined}
              >
                {submitting ? 'A criar...' : 'Confirmar Marcação'}
              </Button>
            </YStack>
          </Card>
        </YStack>
      )}

    </YStack>
  );
}