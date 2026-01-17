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
  RadioGroup,
} from 'tamagui';
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { usersApi, User, RegisterUserData, UpdateUserData } from '@/api/users';

interface FormData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: string;
}

export default function ConfiguracoesPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'mecanico_gerente',
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'mecanico_gerente', label: 'Mecânico Gerente' },
  ];

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error: any) {
      console.error('Erro ao carregar utilizadores:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os utilizadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Register user
  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.full_name) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const registerData: RegisterUserData = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email || undefined,
        role: formData.role,
      };

      await usersApi.register(registerData);
      
      Alert.alert('Sucesso', 'Utilizador registado com sucesso');
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role: 'mecanico_gerente',
      });
      
      // Refresh list
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao registar:', error);
      Alert.alert('Erro', error.message || 'Erro ao registar utilizador');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = (user: User) => {
    Alert.alert(
      'Confirmar eliminação',
      `Tem a certeza que deseja eliminar ${user.full_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.delete(user.id);
              Alert.alert('Sucesso', 'Utilizador eliminado');
              fetchUsers();
            } catch (error: any) {
              console.error('Erro ao eliminar:', error);
              Alert.alert('Erro', error.message || 'Erro ao eliminar utilizador');
            }
          },
        },
      ]
    );
  };

  // Update user
  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const updateData: UpdateUserData = {
        full_name: editingUser.full_name,
        email: editingUser.email || undefined,
        role: editingUser.role,
      };

      await usersApi.update(editingUser.id, updateData);
      
      Alert.alert('Sucesso', 'Utilizador atualizado');
      setEditSheetOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', error.message || 'Erro ao atualizar utilizador');
    }
  };

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        <H1>Configurações</H1>

        {/* Register User Section */}
        <Card elevate padded>
          <YStack space="$3">
            <XStack alignItems="center" space="$2">
              <UserPlus size={24} color={theme.orange?.get()} />
              <H3>Registar Utilizador</H3>
            </XStack>

            <Separator />

            <YStack space="$2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="username"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                autoCapitalize="none"
              />
            </YStack>

            <YStack space="$2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry
              />
            </YStack>

            <YStack space="$2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                placeholder="João Silva"
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_name: text })
                }
              />
            </YStack>

            <YStack space="$2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="joao@example.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </YStack>

            <YStack space="$2">
              <Label>Role *</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <YStack space="$2">
                  {roles.map((role) => (
                    <XStack
                      key={role.value}
                      alignItems="center"
                      space="$3"
                      padding="$3"
                      backgroundColor={
                        formData.role === role.value ? '$orange3' : '$background'
                      }
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor={
                        formData.role === role.value ? '$orange8' : '$borderColor'
                      }
                      pressStyle={{ scale: 0.98 }}
                      onPress={() =>
                        setFormData({ ...formData, role: role.value })
                      }
                    >
                      <RadioGroup.Item value={role.value} id={role.value}>
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>
                      <Label htmlFor={role.value} flex={1}>
                        {role.label}
                      </Label>
                    </XStack>
                  ))}
                </YStack>
              </RadioGroup>
            </YStack>

            <Button
              theme="orange"
              onPress={handleRegister}
              disabled={submitting}
              icon={submitting ? <Spinner /> : <UserPlus size={20} />}
              marginTop="$2"
            >
              {submitting ? 'A registar...' : 'Registar Utilizador'}
            </Button>
          </YStack>
        </Card>

        {/* Users List Section */}
        <Card elevate padded>
          <YStack space="$3">
            <H3>Utilizadores Registados</H3>
            <Separator />

            {loading ? (
              <XStack justifyContent="center" padding="$4">
                <Spinner size="large" />
              </XStack>
            ) : users.length === 0 ? (
              <XStack
                justifyContent="center"
                alignItems="center"
                space="$2"
                padding="$4"
              >
                <AlertCircle size={20} color={theme.color?.get()} />
                <Text color="$gray10">Nenhum utilizador encontrado</Text>
              </XStack>
            ) : (
              <YStack space="$2">
                {users.map((user) => (
                  <Card key={user.id} bordered padding="$3">
                    <YStack space="$2">
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack flex={1}>
                          <Text fontWeight="bold" fontSize="$5">
                            {user.full_name}
                          </Text>
                          <Text color="$gray11" fontSize="$3">
                            @{user.username}
                          </Text>
                          {user.email && (
                            <Text color="$gray11" fontSize="$2">
                              {user.email}
                            </Text>
                          )}
                        </YStack>

                        <XStack space="$2" alignItems="center">
                          <Card
                            backgroundColor="$orange4"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$3"
                          >
                            <Text
                              color="$orange11"
                              fontSize="$2"
                              fontWeight="600"
                            >
                              {roles.find((r) => r.value === user.role)?.label ||
                                user.role}
                            </Text>
                          </Card>

                          <Button
                            size="$3"
                            circular
                            icon={<Pencil size={16} />}
                            onPress={() => {
                              setEditingUser(user);
                              setEditSheetOpen(true);
                            }}
                            chromeless
                          />

                          <Button
                            size="$3"
                            circular
                            icon={<Trash2 size={16} />}
                            onPress={() => handleDelete(user)}
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
        {editSheetOpen && editingUser && (
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
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H3>Editar Utilizador</H3>
                <Button
                  size="$3"
                  circular
                  icon={<X size={20} />}
                  onPress={() => {
                    setEditSheetOpen(false);
                    setEditingUser(null);
                  }}
                  chromeless
                />
              </XStack>

              <Separator />

              <YStack space="$2">
                <Label>Username</Label>
                <Input value={editingUser.username} disabled opacity={0.5} />
              </YStack>

              <YStack space="$2">
                <Label>Nome Completo</Label>
                <Input
                  value={editingUser.full_name}
                  onChangeText={(text) =>
                    setEditingUser({ ...editingUser, full_name: text })
                  }
                />
              </YStack>

              <YStack space="$2">
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChangeText={(text) =>
                    setEditingUser({ ...editingUser, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </YStack>

              <YStack space="$2">
                <Label>Role</Label>
                <RadioGroup
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <YStack space="$2">
                    {roles.map((role) => (
                      <XStack
                        key={role.value}
                        alignItems="center"
                        space="$3"
                        padding="$3"
                        backgroundColor={
                          editingUser.role === role.value
                            ? '$orange3'
                            : '$background'
                        }
                        borderRadius="$4"
                        borderWidth={1}
                        borderColor={
                          editingUser.role === role.value
                            ? '$orange8'
                            : '$borderColor'
                        }
                        pressStyle={{ scale: 0.98 }}
                        onPress={() =>
                          setEditingUser({ ...editingUser, role: role.value })
                        }
                      >
                        <RadioGroup.Item value={role.value} id={`edit-${role.value}`}>
                          <RadioGroup.Indicator />
                        </RadioGroup.Item>
                        <Label htmlFor={`edit-${role.value}`} flex={1}>
                          {role.label}
                        </Label>
                      </XStack>
                    ))}
                  </YStack>
                </RadioGroup>
              </YStack>

              <XStack space="$3" marginTop="$2">
                <Button
                  flex={1}
                  onPress={() => {
                    setEditSheetOpen(false);
                    setEditingUser(null);
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
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}
