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
  UserPlus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { clientsApi, Client, ClientCreate, ClientUpdate } from '@/api/clients';

interface FormData {
  name: string;
  email: string;
  nif: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  notes: string;
}

export default function ClientesPage() {
  const theme = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    nif: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    notes: '',
  });

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Create client
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.nif) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios (Nome, Email, NIF)');
      return;
    }

    setSubmitting(true);
    try {
      const createData: ClientCreate = {
        name: formData.name,
        email: formData.email,
        nif: formData.nif,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        address: {
          street: formData.address || undefined,
          city: formData.city || undefined,
          zipCode: formData.postal_code || undefined,
        },
      };

      await clientsApi.create(createData);

      Alert.alert('Sucesso', 'Cliente criado com sucesso');

      // Reset form
      setFormData({
        name: '',
        email: '',
        nif: '',
        phone: '',
        address: '',
        postal_code: '',
        city: '',
        notes: '',
      });

      fetchClients();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      
      // Tratamento de erros específicos do backend
      if (error.message.includes('duplicate_nif')) {
        Alert.alert('Erro', 'Já existe um cliente com este NIF');
      } else if (error.message.includes('duplicate_email')) {
        Alert.alert('Erro', 'Já existe um cliente com este Email');
      } else {
        Alert.alert('Erro', error.message || 'Erro ao criar cliente');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete client
  const handleDelete = (client: Client) => {
    Alert.alert(
      'Confirmar eliminação',
      `Tem a certeza que deseja eliminar ${client.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientsApi.delete(client.id);
              Alert.alert('Sucesso', 'Cliente eliminado');
              fetchClients();
            } catch (error: any) {
              console.error('Erro ao eliminar:', error);
              
              if (error.message.includes('active_work_orders')) {
                Alert.alert(
                  'Erro',
                  'Não é possível eliminar este cliente porque tem ordens de trabalho ativas.'
                );
              } else {
                Alert.alert('Erro', error.message || 'Erro ao eliminar cliente');
              }
            }
          },
        },
      ]
    );
  };

  // Update client
  const handleUpdate = async () => {
    if (!editingClient) return;

    try {
      const updateData: ClientUpdate = {
        name: editingClient.name,
        email: editingClient.email,
        nif: editingClient.nif,
        phone: editingClient.phone || undefined,
        notes: editingClient.notes || undefined,
        address: {
          street: editingClient.address?.street || undefined,
          city: editingClient.address?.city || undefined,
          zipCode: editingClient.address?.zipCode || undefined,
        },
      };

      await clientsApi.update(editingClient.id, updateData);

      Alert.alert('Sucesso', 'Cliente atualizado');
      setEditSheetOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', error.message || 'Erro ao atualizar cliente');
    }
  };

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        <H1>Clientes</H1>

        {/* Create Client Form */}
        <Card elevate padded>
          <YStack space="$3">
            <XStack alignItems="center" space="$2">
              <UserPlus size={24} color={theme.orange?.get()} />
              <H3>Novo Cliente</H3>
            </XStack>

            <Separator />

            <XStack space="$3">
              <YStack space="$2" flex={1}>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </YStack>

              <YStack space="$2" flex={1}>
                <Label htmlFor="nif">NIF *</Label>
                <Input
                  id="nif"
                  placeholder="123456789"
                  value={formData.nif}
                  onChangeText={(text) => setFormData({ ...formData, nif: text })}
                  keyboardType="numeric"
                  maxLength={9}
                />
              </YStack>
            </XStack>

            <XStack space="$3">
              <YStack space="$2" flex={1}>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  placeholder="joao@example.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </YStack>

              <YStack space="$2" flex={1}>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="912345678"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </YStack>
            </XStack>

            <YStack space="$2">
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                placeholder="Rua Principal, 123"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
            </YStack>

            <XStack space="$3">
              <YStack space="$2" flex={1}>
                <Label htmlFor="postal_code">Código Postal</Label>
                <Input
                  id="postal_code"
                  placeholder="4000-123"
                  value={formData.postal_code}
                  onChangeText={(text) =>
                    setFormData({ ...formData, postal_code: text })
                  }
                />
              </YStack>

              <YStack space="$2" flex={1}>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Porto"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </YStack>
            </XStack>

            <YStack space="$2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Observações adicionais"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />
            </YStack>

            <Button
              theme="orange"
              onPress={handleCreate}
              disabled={submitting}
              icon={submitting ? <Spinner /> : <UserPlus size={20} />}
              marginTop="$2"
            >
              {submitting ? 'A criar...' : 'Criar Cliente'}
            </Button>
          </YStack>
        </Card>

        {/* Clients List */}
        <Card elevate padded>
          <YStack space="$3">
            <H3>Lista de Clientes</H3>
            <Separator />

            {loading ? (
              <XStack justifyContent="center" padding="$4">
                <Spinner size="large" />
              </XStack>
            ) : clients.length === 0 ? (
              <XStack
                justifyContent="center"
                alignItems="center"
                space="$2"
                padding="$4"
              >
                <AlertCircle size={20} color={theme.color?.get()} />
                <Text color="$gray10">Nenhum cliente encontrado</Text>
              </XStack>
            ) : (
              <YStack space="$2">
                {clients.map((client, index) => (
                  <Card key={client.id || index} bordered padding="$3">
                    <YStack space="$2">
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack flex={1} space="$1">
                          <Text fontWeight="bold" fontSize="$5">
                            {client.name}
                          </Text>

                          <XStack alignItems="center" space="$2">
                            <Mail size={14} color={theme.gray11?.get()} />
                            <Text color="$gray11" fontSize="$3">
                              {client.email}
                            </Text>
                          </XStack>

                          <XStack alignItems="center" space="$2">
                            <FileText size={14} color={theme.gray11?.get()} />
                            <Text color="$gray11" fontSize="$3">
                              NIF: {client.nif}
                            </Text>
                          </XStack>

                          {client.phone && (
                            <XStack alignItems="center" space="$2">
                              <Phone size={14} color={theme.gray11?.get()} />
                              <Text color="$gray11" fontSize="$3">
                                {client.phone}
                              </Text>
                            </XStack>
                          )}

                          {client.address && (
                            <XStack alignItems="center" space="$2">
                              <MapPin size={14} color={theme.gray11?.get()} />
                              <Text color="$gray11" fontSize="$2">
                                {client.address.street}
                                {client.address.city && `, ${client.address.city}`}
                                {client.address.zipCode && ` (${client.address.zipCode})`}
                              </Text>
                            </XStack>
                          )}
                        </YStack>

                        <XStack space="$2">
                          <Button
                            size="$3"
                            circular
                            icon={<Pencil size={16} />}
                            onPress={() => {
                              setEditingClient(client);
                              setEditSheetOpen(true);
                            }}
                            chromeless
                          />

                          <Button
                            size="$3"
                            circular
                            icon={<Trash2 size={16} />}
                            onPress={() => handleDelete(client)}
                            theme="red"
                            chromeless
                          />
                        </XStack>
                      </XStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            )}
          </YStack>
        </Card>

        {/* Edit Sheet (Simulada com Card, igual ao configuracoes.tsx) */}
      {editSheetOpen && editingClient && (
        <>
          <Card
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            padding="$4"
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
            backgroundColor="$background"
            elevate
            animation="quick"
            enterStyle={{ y: 300, opacity: 0 }}
            exitStyle={{ y: 300, opacity: 0 }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <H3>Editar Cliente</H3>
                  <Button
                    size="$3"
                    circular
                    icon={<X size={20} />}
                    onPress={() => {
                      setEditSheetOpen(false);
                      setEditingClient(null);
                    }}
                    chromeless
                  />
                </XStack>

                <Separator />

                <YStack space="$2">
                  <Label>Nome</Label>
                  <Input
                    value={editingClient.name}
                    onChangeText={(text) =>
                      setEditingClient({ ...editingClient, name: text })
                    }
                  />
                </YStack>

                <YStack space="$2">
                  <Label>Email</Label>
                  <Input
                    value={editingClient.email}
                    onChangeText={(text) =>
                      setEditingClient({ ...editingClient, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </YStack>

                <YStack space="$2">
                  <Label>NIF</Label>
                  <Input
                    value={editingClient.nif}
                    onChangeText={(text) =>
                      setEditingClient({ ...editingClient, nif: text })
                    }
                    keyboardType="numeric"
                  />
                </YStack>

                <YStack space="$2">
                  <Label>Telefone</Label>
                  <Input
                    value={editingClient.phone || ''}
                    onChangeText={(text) =>
                      setEditingClient({ ...editingClient, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </YStack>

                <YStack space="$2">
                  <Label>Morada (Rua)</Label>
                  <Input
                    value={editingClient.address?.street || ''}
                    onChangeText={(text) =>
                      setEditingClient({
                        ...editingClient,
                        address: {
                          ...editingClient.address,
                          street: text,
                        },
                      })
                    }
                  />
                </YStack>

                <XStack space="$3">
                  <YStack space="$2" flex={1}>
                    <Label>Código Postal</Label>
                    <Input
                      value={editingClient.address?.zipCode || ''}
                      onChangeText={(text) =>
                        setEditingClient({
                          ...editingClient,
                          address: {
                            ...editingClient.address,
                            zipCode: text,
                          },
                        })
                      }
                    />
                  </YStack>

                  <YStack space="$2" flex={1}>
                    <Label>Cidade</Label>
                    <Input
                      value={editingClient.address?.city || ''}
                      onChangeText={(text) =>
                        setEditingClient({
                          ...editingClient,
                          address: {
                            ...editingClient.address,
                            city: text,
                          },
                        })
                      }
                    />
                  </YStack>
                </XStack>

                <XStack space="$3" marginTop="$2">
                  <Button
                    flex={1}
                    onPress={() => {
                      setEditSheetOpen(false);
                      setEditingClient(null);
                    }}
                    chromeless
                  >
                    Cancelar
                  </Button>
                  <Button flex={1} theme="orange" onPress={handleUpdate}>
                    Guardar
                  </Button>
                </XStack>
              </YStack>
            </ScrollView>
          </Card>
        </>
      )}
    </YStack>
  </ScrollView>
);
}