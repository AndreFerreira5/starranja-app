import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  YStack,
  H1,
  Text,
  ScrollView,
  Separator,
  Button,
  XStack,
  H4,
  Input,
  View,
} from 'tamagui';

// --- Tipos ---
type Cliente = {
  id: string;
  nome: string;
  matricula: string;
  modelo: string;
};

export default function GestaoClientesPage() {
  // Controle de Navegação Interna
  const [view, setView] = useState<'lista' | 'detalhe' | 'novo'>('lista');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // Estados para o Formulário (Página 9)
  const [novoNome, setNovoNome] = useState('');
  const [novoModelo, setNovoModelo] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');

  // Mock de dados para a lista (Página 4)
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: '1', nome: 'Carlos Ferreira', matricula: '45-AA-32', modelo: 'Volkswagen Golf 1.6' },
    { id: '2', nome: 'João Luís', matricula: '67-PO-00', modelo: 'BMW 320d' },
    { id: '3', nome: 'Marta Silva', matricula: '12-KJ-95', modelo: 'Renault Clio' },
    { id: '4', nome: 'Carolina Martins', matricula: '42-YG-77', modelo: 'Peugeot 208' },
  ]);

  // Função para limpar o formulário ao cancelar ou guardar
  const limparFormulario = () => {
    setNovoNome('');
    setNovoModelo('');
    setNovaMatricula('');
    setView('lista');
  };

  return (
    <View flex={1} backgroundColor="#4B4842">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <YStack padding="$4" alignItems="center" paddingTop="$10">
          
          <H1 color="white" marginBottom="$6" fontWeight="800" fontSize={28} textAlign="center">
            Gestão de Clientes
          </H1>

          {/* --- VIEW: LISTA DE CLIENTES (Página 4) --- */}
          {view === 'lista' && (
            <YStack width="95%" gap="$4">
              <Button 
                backgroundColor="$gray8" 
                borderRadius="$10"
                onPress={() => setView('novo')}
                alignSelf="flex-start"
                size="$3"
              >
                <Text fontWeight="bold" color="white">Adicionar Cliente +</Text>
              </Button>

              <YStack backgroundColor="#C4D1CD" padding="$4" borderRadius="$8" elevation={5}>
                <H4 textAlign="center" marginBottom="$3" color="#333">Lista de Clientes</H4>
                <Separator marginBottom="$4" borderColor="$gray8" />
                
                {clientes.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => { setClienteSelecionado(item); setView('detalhe'); }}
                  >
                    <XStack 
                      backgroundColor={index % 2 === 0 ? "white" : "#ADBAB6"} 
                      padding="$3" 
                      borderRadius="$2" 
                      justifyContent="space-between"
                      marginBottom="$2"
                    >
                      <Text fontWeight="bold" color="#333">{item.nome}</Text>
                      <Text fontWeight="bold" color="#333">{item.matricula}</Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            </YStack>
          )}

          {/* --- VIEW: DETALHE DO CLIENTE (Página 8) --- */}
          {view === 'detalhe' && clienteSelecionado && (
            <YStack width="95%" gap="$4">
              <YStack backgroundColor="#C4D1CD" padding="$5" borderRadius="$8" minHeight={350} gap="$4">
                <H4 textAlign="center" color="#333" marginBottom="$4">Cliente</H4>
                
                <YStack gap="$2">
                  <Text fontSize={16} color="#333"><Text fontWeight="bold">Nome: </Text>{clienteSelecionado.nome}</Text>
                  <Text fontSize={16} color="#333"><Text fontWeight="bold">Modelo(s): </Text>{clienteSelecionado.modelo}</Text>
                  <Text fontSize={16} color="#333"><Text fontWeight="bold">Matrícula(s): </Text>{clienteSelecionado.matricula}</Text>
                </YStack>

                <Button backgroundColor="#9AA8A4" marginTop="$6" borderRadius="$5">
                   <Text color="#333" fontWeight="bold">Ver Folha(s) de Obra</Text>
                </Button>

                <Button 
                  chromeless 
                  marginTop="auto" 
                  onPress={() => setView('lista')}
                >
                  <Text fontWeight="bold" color="#333">Adicionar veículo +</Text>
                </Button>
              </YStack>
              <Button onPress={() => setView('lista')} variant="outline" color="white" borderColor="white">
                Voltar à lista
              </Button>
            </YStack>
          )}

          {/* --- VIEW: FORMULÁRIO NOVO CLIENTE (Página 9) --- */}
          {view === 'novo' && (
            <YStack width="95%" gap="$4">
              <YStack backgroundColor="#C4D1CD" padding="$5" borderRadius="$8" gap="$4">
                <H4 textAlign="center" color="#333">Cliente</H4>
                
                <YStack gap="$1">
                  <Text fontWeight="bold" color="#333">Nome:</Text>
                  <Input 
                    backgroundColor="white" 
                    color="#333" 
                    borderWidth={0} 
                    value={novoNome}
                    onChangeText={setNovoNome}
                  />
                </YStack>

                <YStack gap="$1">
                  <Text fontWeight="bold" color="#333">Modelo(s):</Text>
                  <Input 
                    backgroundColor="white" 
                    color="#333" 
                    borderWidth={0} 
                    value={novoModelo}
                    onChangeText={setNovoModelo}
                  />
                </YStack>

                <YStack gap="$1">
                  <Text fontWeight="bold" color="#333">Matrícula(s):</Text>
                  <Input 
                    backgroundColor="white" 
                    color="#333" 
                    borderWidth={0} 
                    value={novaMatricula}
                    onChangeText={setNovaMatricula}
                  />
                </YStack>

                <Button 
                    chromeless 
                    marginTop="$4" 
                    onPress={() => {
                        // Aqui o teu colega fará a chamada à API
                        console.log("Dados para enviar:", { novoNome, novoModelo, novaMatricula });
                        limparFormulario();
                    }}
                >
                  <Text fontWeight="bold" color="#333">Adicionar cliente</Text>
                </Button>
              </YStack>
              <Button onPress={limparFormulario} variant="outline" color="white" borderColor="white">
                Cancelar
              </Button>
            </YStack>
          )}

        </YStack>
      </ScrollView>
    </View>
  );
}