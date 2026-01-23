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
  PackagePlus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Truck,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { 
  supplierOrdersApi, 
  SupplierOrder, 
  SupplierOrderCreate, 
  SupplierOrderUpdate,
  SupplierOrderStatus 
} from '@/api/supplierOrders';

const getStatusConfig = (status: string) => {
  const normalized = status?.toLowerCase() || 'pending';

  switch (normalized) {
    case 'ordered':
      return { label: 'Encomendado', colorName: 'blue', Icon: Truck, value: 'Ordered' };
    case 'received':
      return { label: 'Recebido', colorName: 'green', Icon: CheckCircle, value: 'Received' };
    case 'cancelled':
      return { label: 'Cancelado', colorName: 'red', Icon: Ban, value: 'Cancelled' };
    case 'pending':
    default:
      return { label: 'Pendente', colorName: 'orange', Icon: Clock, value: 'Pending' };
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);
  const theme = useTheme();
  const Icon = config.Icon;

  const iconColor = theme[`${config.colorName}10`]?.get(); 

  return (
    <XStack 
      alignSelf="flex-start"
      backgroundColor={`$${config.colorName}3`}
      borderColor={`$${config.colorName}5`}
      borderWidth={1}
      paddingHorizontal="$2.5" 
      paddingVertical="$1.5" 
      borderRadius="$4" 
      alignItems="center" 
      space="$1.5"
    >
      <Icon size={12} color={iconColor} />
      <Text 
        color={`$${config.colorName}11`}
        fontSize="$2" 
        fontWeight="700"
      >
        {config.label}
      </Text>
    </XStack>
  );
};

export default function EncomendasPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    supplierName: '',
    description: '',
  });

  const [editingOrder, setEditingOrder] = useState<SupplierOrder | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await supplierOrdersApi.getAll();
      setOrders(data);
    } catch (error: any) {
      console.error('Erro ao carregar encomendas:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar as encomendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreate = async () => {
    if (!formData.supplierName || !formData.description) {
      Alert.alert('Erro', 'Preencha o fornecedor e a descrição');
      return;
    }

    setSubmitting(true);
    try {
      const createData: SupplierOrderCreate = {
        supplierName: formData.supplierName,
        description: formData.description,
        status: 'Pending',
      };

      await supplierOrdersApi.create(createData);
      Alert.alert('Sucesso', 'Encomenda criada com sucesso');
      
      setFormData({ supplierName: '', description: '' });
      fetchOrders();
    } catch (error: any) {
      console.error('Erro ao criar:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar encomenda');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (order: SupplierOrder) => {
    Alert.alert(
      'Eliminar Encomenda',
      `Tem a certeza que deseja eliminar a encomenda de ${order.supplierName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await supplierOrdersApi.delete(order._id);
              fetchOrders();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao eliminar');
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;

    try {
      const updateData: SupplierOrderUpdate = {
        supplierName: editingOrder.supplierName,
        description: editingOrder.description,
        status: editingOrder.status,
      };

      await supplierOrdersApi.update(editingOrder._id, updateData);
      
      Alert.alert('Sucesso', 'Encomenda atualizada');
      setEditSheetOpen(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar');
    }
  };

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        <H1>Encomendas</H1>

        {/* Create Form */}
        <Card elevate padded>
          <YStack space="$3">
            <XStack alignItems="center" space="$2">
              <PackagePlus size={24} color={theme.orange?.get()} />
              <H3>Nova Encomenda</H3>
            </XStack>
            <Separator />
            
            <YStack space="$2">
              <Label>Fornecedor *</Label>
              <Input
                placeholder="Ex: Auto Peças Silva"
                value={formData.supplierName}
                onChangeText={(t) => setFormData({ ...formData, supplierName: t })}
              />
            </YStack>

            <YStack space="$2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Ex: Peças para revisão Toyota"
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
              />
            </YStack>

            <Button
              theme="orange"
              onPress={handleCreate}
              disabled={submitting}
              icon={submitting ? <Spinner /> : <PackagePlus size={20} />}
              marginTop="$2"
            >
              {submitting ? 'A criar...' : 'Criar Encomenda'}
            </Button>
          </YStack>
        </Card>

        {/* List */}
        <Card elevate padded>
          <YStack space="$3">
            <H3>Histórico</H3>
            <Separator />

            {loading ? (
              <Spinner size="large" />
            ) : orders.length === 0 ? (
              <XStack justifyContent="center" padding="$4" space="$2">
                <AlertCircle size={20} color={theme.color?.get()} />
                <Text color="$gray10">Nenhuma encomenda registada</Text>
              </XStack>
            ) : (
              <YStack space="$2">
                {orders.map((order, index) => (
                  <Card key={order._id || index} bordered padding="$3">
                    <YStack space="$2">
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack flex={1} space="$1">
                          <Text fontWeight="bold" fontSize="$5">{order.supplierName}</Text>
                          <Text color="$gray11" fontSize="$3">{order.description}</Text>
                          
                          <XStack marginTop="$2">
                            <StatusBadge status={order.status} />
                          </XStack>
                        </YStack>

                        <XStack space="$2">
                          <Button
                            size="$3"
                            circular
                            icon={<Pencil size={16} />}
                            onPress={() => {
                              setEditingOrder(order);
                              setEditSheetOpen(true);
                            }}
                            chromeless
                          />
                          <Button
                            size="$3"
                            circular
                            icon={<Trash2 size={16} />}
                            onPress={() => handleDelete(order)}
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

        {/* Edit Sheet */}
        {editSheetOpen && editingOrder && (
          <>
            <YStack
              position="absolute"
              top={0} left={0} right={0} bottom={0}
              backgroundColor="rgba(0,0,0,0.5)"
              onPress={() => setEditSheetOpen(false)}
              zIndex={99999}
            />
            <Card
              position="absolute"
              bottom={0} left={0} right={0}
              padding="$4"
              borderTopLeftRadius="$6"
              borderTopRightRadius="$6"
              backgroundColor="$background"
              elevate
              animation="quick"
              enterStyle={{ y: 300, opacity: 0 }}
              exitStyle={{ y: 300, opacity: 0 }}
              zIndex={100000}
              maxHeight="85%"
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <YStack space="$4" paddingBottom="$8">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Editar Encomenda</H3>
                    <Button
                      size="$3"
                      circular
                      icon={<X size={20} />}
                      onPress={() => {
                        setEditSheetOpen(false);
                        setEditingOrder(null);
                      }}
                      chromeless
                    />
                  </XStack>
                  <Separator />

                  <YStack space="$2">
                    <Label>Fornecedor</Label>
                    <Input
                      value={editingOrder.supplierName || ''}
                      onChangeText={(t) => setEditingOrder({...editingOrder, supplierName: t})}
                    />
                  </YStack>

                  <YStack space="$2">
                    <Label>Descrição</Label>
                    <Input
                      value={editingOrder.description || ''}
                      onChangeText={(t) => setEditingOrder({...editingOrder, description: t})}
                    />
                  </YStack>

                  <YStack space="$2">
                    <Label>Estado</Label>
                    <XStack space="$2" flexWrap="wrap">
                      {['Pending', 'Ordered', 'Received', 'Cancelled'].map((statusOption) => {
                        const config = getStatusConfig(statusOption);
                        const isSelected = editingOrder.status === statusOption;
                        
                        return (
                          <Button 
                            key={statusOption}
                            size="$3"
                            backgroundColor={isSelected ? `$${config.colorName}9` : '$gray4'}
                            color={isSelected ? 'white' : '$gray11'}
                            onPress={() => setEditingOrder({
                              ...editingOrder, 
                              status: statusOption as SupplierOrderStatus
                            })}
                          >
                            {config.label}
                          </Button>
                        );
                      })}
                    </XStack>
                  </YStack>

                  <XStack space="$3" marginTop="$2">
                    <Button flex={1} onPress={() => setEditSheetOpen(false)} chromeless>
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