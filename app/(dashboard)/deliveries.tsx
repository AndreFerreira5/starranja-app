import { useEffect, useMemo, useState } from 'react'
import { Alert as RNAlert, Linking } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  Button,
  Card,
  H2,
  H4,
  Input,
  ScrollView,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
  useTheme,
} from 'tamagui'
import {
  ArrowLeft,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Car,
  PackageCheck,
  Phone,
  CheckCircle2,
  Clock,
  Euro,
} from 'lucide-react-native'

type DeliveryStatus = 'ready' | 'delivered'
type PaymentStatus = 'paid' | 'pending'

type Delivery = {
  id: string
  workOrderId: string
  workOrderNumber: number
  customerName: string
  customerPhone?: string
  vehicleLabel: string
  readyAtISO: string
  status: DeliveryStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  location?: string // Ex: Parque A, Box 2
}

type FilterStatus = 'all' | DeliveryStatus

// ---------- Helpers ----------

const euro = (v: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v)

function statusLabel(s: DeliveryStatus) {
  switch (s) {
    case 'ready':
      return 'Pronta para entrega'
    case 'delivered':
      return 'Entregue'
    default:
      return '—'
  }
}

function statusColor(theme: any, s: DeliveryStatus) {
  switch (s) {
    case 'ready':
      return theme.green10?.get() ?? 'green'
    case 'delivered':
      return theme.gray8?.get() ?? 'gray'
    default:
      return theme.color?.get() ?? '#999'
  }
}

// ---------- Mock Data ----------
const now = new Date()

const mockDeliveries: Delivery[] = [
  {
    id: 'del-001',
    workOrderId: 'wo-1004',
    workOrderNumber: 18,
    customerName: 'Tiago Mendes',
    customerPhone: '911222333',
    vehicleLabel: 'BMW 320d (BB-88-CC)',
    readyAtISO: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // há 2 horas
    status: 'ready',
    paymentStatus: 'pending',
    totalAmount: 350.50,
    location: 'Box 3',
  },
  {
    id: 'del-002',
    workOrderId: 'wo-0995',
    workOrderNumber: 5,
    customerName: 'Rita Pereira',
    customerPhone: '966555444',
    vehicleLabel: 'Mini Cooper (DD-11-EE)',
    readyAtISO: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // ontem
    status: 'ready',
    paymentStatus: 'paid',
    totalAmount: 120.00,
    location: 'Parque Exterior',
  },
  {
    id: 'del-003',
    workOrderId: 'wo-0990',
    workOrderNumber: 2,
    customerName: 'João Santos',
    vehicleLabel: 'Ford Fiesta (AA-00-BB)',
    readyAtISO: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'delivered',
    paymentStatus: 'paid',
    totalAmount: 85.00,
  },
]

// ---------- Components ----------

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) => (
  <Button
    size="$3"
    onPress={onPress}
    borderWidth={1}
    borderColor={active ? '$orange10' : '$borderColor'}
    backgroundColor={active ? '$orange5' : '$gray3'}
    pressStyle={{ scale: 0.98 }}
  >
    {label}
  </Button>
)

const Tag = ({ text, color }: { text: string; color?: string }) => (
  <Card paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" backgroundColor={color ?? "$gray4"}>
    <Text fontSize="$2" opacity={0.9} color={color ? 'white' : '$color'}>
      {text}
    </Text>
  </Card>
)

const DeliveryCard = ({
  item,
  expanded,
  onToggleExpanded,
  onDeliver,
  onContact,
}: {
  item: Delivery
  expanded: boolean
  onToggleExpanded: () => void
  onDeliver: () => void
  onContact: () => void
}) => {
  const theme = useTheme()
  const sColor = statusColor(theme, item.status)
  const isReady = item.status === 'ready'

  return (
    <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor={isReady ? sColor : "$borderColor"}>
      <YStack gap="$3">
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <XStack flex={1} gap="$3" alignItems="flex-start">
            <PackageCheck size={20} color={sColor} />
            <YStack flex={1} gap="$1">
              <H4 color="$color">{item.vehicleLabel}</H4>
              <Text opacity={0.8} color="$color">
                {item.customerName}
              </Text>
              
              <XStack gap="$2" flexWrap="wrap" marginTop="$1">
                <Tag text={`FO #${item.workOrderNumber}`} />
                {item.location && isReady && <Tag text={item.location} />}
                <Tag 
                  text={item.paymentStatus === 'paid' ? 'Pago' : 'Não Pago'} 
                  color={item.paymentStatus === 'paid' ? '$green9' : '$red9'} 
                />
              </XStack>
            </YStack>
          </XStack>

          <Button size="$3" chromeless onPress={onToggleExpanded}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </XStack>

        {expanded && (
          <YStack gap="$2">
            <Separator />
            <Text opacity={0.85} color="$color">
              Pronta desde: {new Date(item.readyAtISO).toLocaleString('pt-PT')}
            </Text>
            <Text opacity={0.85} color="$color">
              Total a pagar: <Text fontWeight="bold">{euro(item.totalAmount)}</Text>
            </Text>

            <XStack gap="$2" flexWrap="wrap" marginTop="$2">
              {item.status === 'ready' && (
                <Button 
                  size="$3" 
                  theme="green" 
                  onPress={onDeliver} 
                  icon={CheckCircle2}
                  disabled={item.paymentStatus === 'pending'}
                  opacity={item.paymentStatus === 'pending' ? 0.5 : 1}
                >
                  Registar Entrega
                </Button>
              )}
              
              {item.customerPhone && (
                <Button size="$3" onPress={onContact} icon={Phone}>
                  Ligar Cliente
                </Button>
              )}
            </XStack>
            
            {item.status === 'ready' && item.paymentStatus === 'pending' && (
              <Text fontSize="$2" color="$red10" marginTop="$1">
                ⚠️ Regularizar pagamento antes de entregar.
              </Text>
            )}
          </YStack>
        )}
      </YStack>
    </Card>
  )
}

export default function DeliveriesPage() {
  const insets = useSafeAreaInsets()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ready') // Default mostra apenas as prontas

  const fetchDeliveries = async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 600))
      setDeliveries(mockDeliveries)
    } catch (e: any) {
      setError('Erro ao carregar entregas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const filteredDeliveries = useMemo(() => {
    const q = search.trim().toLowerCase()

    return deliveries
      .filter((d) => (filterStatus === 'all' ? true : d.status === filterStatus))
      .filter((d) => {
        if (!q) return true
        const hay = `${d.customerName} ${d.vehicleLabel} ${d.workOrderNumber}`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => new Date(b.readyAtISO).getTime() - new Date(a.readyAtISO).getTime())
  }, [deliveries, search, filterStatus])

  const handleDeliver = (id: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'delivered' } : d))
    )
    RNAlert.alert('Sucesso', 'Viatura entregue ao cliente.')
  }

  const handleContact = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`)
    else RNAlert.alert('Erro', 'Telefone não disponível.')
  }

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('ready')
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.get() as any }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView backgroundColor="$background">
        <YStack paddingTop="$3" paddingBottom={insets.bottom + 16} paddingHorizontal="$4">
          <YStack width="100%" maxWidth={520} alignSelf="center" gap="$4">
            
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Button
                size="$3"
                chromeless
                onPress={() => {
                  if (router.canGoBack()) router.back()
                  else router.replace('/(tabs)')
                }}
              >
                <XStack gap="$2" alignItems="center">
                  <ArrowLeft size={18} color={theme.color?.get()} />
                  <Text color="$color">Voltar</Text>
                </XStack>
              </Button>

              <Button size="$3" onPress={fetchDeliveries}>
                <XStack gap="$2" alignItems="center">
                  <RefreshCcw size={18} />
                  <Text>Atualizar</Text>
                </XStack>
              </Button>
            </XStack>

            {/* Title */}
            <YStack gap="$1">
              <H2 color="$color">Entregas</H2>
              <Text opacity={0.8} color="$color">
                A aguardar levantamento: {deliveries.filter(d => d.status === 'ready').length}
              </Text>
            </YStack>

            {/* Filters */}
            <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$3">
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack gap="$2" alignItems="center" flex={1}>
                    <Text fontWeight="700" color="$color">Filtros</Text>
                    {filterStatus === 'ready' && <Tag text="Prontas" />}
                    {filterStatus === 'all' && <Tag text="Todas" />}
                  </XStack>

                  <Button size="$3" chromeless onPress={() => setFiltersOpen((v) => !v)}>
                    {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </XStack>

                {filtersOpen && (
                  <YStack gap="$3">
                    <YStack gap="$2">
                      <Text opacity={0.85} color="$color">Pesquisar</Text>
                      <Input
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Cliente, matrícula..."
                        autoCapitalize="none"
                        backgroundColor="$gray3"
                      />
                    </YStack>

                    <Separator />

                    <YStack gap="$2">
                      <Text opacity={0.85} color="$color">Estado</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack gap="$2" paddingVertical="$1">
                          <Chip label="Prontas" active={filterStatus === 'ready'} onPress={() => setFilterStatus('ready')} />
                          <Chip label="Histórico" active={filterStatus === 'delivered'} onPress={() => setFilterStatus('delivered')} />
                          <Chip label="Todas" active={filterStatus === 'all'} onPress={() => setFilterStatus('all')} />
                        </XStack>
                      </ScrollView>
                    </YStack>

                    <XStack justifyContent="flex-end">
                      <Button size="$3" chromeless onPress={clearFilters}>
                        Limpar filtros
                      </Button>
                    </XStack>
                  </YStack>
                )}
              </YStack>
            </Card>

            {/* List */}
            {loading && (
              <YStack alignItems="center" gap="$2" padding="$4">
                <Spinner size="large" />
                <Text color="$color">A carregar entregas...</Text>
              </YStack>
            )}

            {!loading && !error && (
              <YStack gap="$3">
                {filteredDeliveries.length === 0 ? (
                  <Card elevate padded backgroundColor="$gray2">
                    <Text color="$color">Nenhuma viatura encontrada.</Text>
                  </Card>
                ) : (
                  filteredDeliveries.map((d) => (
                    <DeliveryCard
                      key={d.id}
                      item={d}
                      expanded={expandedId === d.id}
                      onToggleExpanded={() => setExpandedId((prev) => (prev === d.id ? null : d.id))}
                      onDeliver={() => handleDeliver(d.id)}
                      onContact={() => handleContact(d.customerPhone)}
                    />
                  ))
                )}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}