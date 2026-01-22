import { useEffect, useMemo, useState } from 'react'
import { Alert as RNAlert, Platform } from 'react-native'
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
  CheckCircle2,
  XCircle,
  Plus,
  CalendarDays, // Ícone novo
} from 'lucide-react-native'

type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'canceled'
type ServiceType = 'maintenance' | 'repair' | 'inspection' | 'other'

type Booking = {
  id: string
  dateISO: string
  time: string // HH:mm
  customerName: string
  vehicleLabel: string
  serviceType: ServiceType
  status: BookingStatus
  notes?: string
}

// Adicionei 'custom' aos filtros
type FilterDatePreset = 'today' | 'tomorrow' | 'custom' | 'all'
type FilterStatus = 'all' | BookingStatus

// ---------- Helpers ----------

function statusLabel(s: BookingStatus) {
  switch (s) {
    case 'pending': return 'Pendente'
    case 'confirmed': return 'Confirmada'
    case 'checked_in': return 'Check-in Feito'
    case 'canceled': return 'Cancelada'
    default: return '—'
  }
}

function statusColor(theme: any, s: BookingStatus) {
  switch (s) {
    case 'checked_in': return theme.green10?.get() ?? 'green'
    case 'confirmed': return theme.blue10?.get() ?? 'dodgerblue'
    case 'pending': return theme.orange10?.get() ?? 'orange'
    case 'canceled': return theme.red10?.get() ?? 'red'
    default: return theme.color?.get() ?? '#999'
  }
}

function serviceLabel(s: ServiceType) {
  switch (s) {
    case 'maintenance': return 'Manutenção'
    case 'repair': return 'Reparação'
    case 'inspection': return 'Inspeção'
    default: return 'Outro'
  }
}

// ---------- Mock Data ----------
const now = new Date()
const todayISO = now.toISOString().split('T')[0]
const tomorrow = new Date(now)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowISO = tomorrow.toISOString().split('T')[0]

// Adicionar uma data futura para teste (daqui a 7 dias)
const nextWeek = new Date(now)
nextWeek.setDate(nextWeek.getDate() + 7)
const nextWeekISO = nextWeek.toISOString().split('T')[0]

const mockBookings: Booking[] = [
  {
    id: 'bk-101',
    dateISO: todayISO,
    time: '09:00',
    customerName: 'Carlos Ferreira',
    vehicleLabel: 'Mercedes A180 (XX-11-XX)',
    serviceType: 'maintenance',
    status: 'checked_in',
    notes: 'Cliente pede para verificar nível de óleo.',
  },
  {
    id: 'bk-102',
    dateISO: todayISO,
    time: '10:30',
    customerName: 'Ana Sousa',
    vehicleLabel: 'Fiat 500 (YY-22-YY)',
    serviceType: 'repair',
    status: 'confirmed',
    notes: 'Barulho nos travões.',
  },
  {
    id: 'bk-103',
    dateISO: tomorrowISO,
    time: '14:00',
    customerName: 'Bruno Gomes',
    vehicleLabel: 'Tesla Model 3 (ZZ-33-ZZ)',
    serviceType: 'inspection',
    status: 'pending',
  },
  {
    id: 'bk-105',
    dateISO: nextWeekISO,
    time: '11:00',
    customerName: 'Marta Lima',
    vehicleLabel: 'Peugeot 2008 (AA-00-BB)',
    serviceType: 'maintenance',
    status: 'pending',
    notes: 'Revisão dos 100.000km.',
  },
]

// ---------- Components ----------

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
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

const Tag = ({ text }: { text: string }) => (
  <Card paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" backgroundColor="$gray4">
    <Text fontSize="$2" opacity={0.9}>{text}</Text>
  </Card>
)

const BookingCard = ({
  item,
  expanded,
  onToggleExpanded,
  onCheckIn,
  onCancel,
}: {
  item: Booking
  expanded: boolean
  onToggleExpanded: () => void
  onCheckIn: () => void
  onCancel: () => void
}) => {
  const theme = useTheme()
  
  return (
    <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
      <YStack gap="$3">
        {/* Header do Card */}
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <XStack flex={1} gap="$3" alignItems="flex-start">
            <YStack alignItems="center" width={50}>
              <Text fontSize="$5" fontWeight="bold" color="$color">{item.time}</Text>
              <Text fontSize="$2" opacity={0.7} color="$color">
                {new Date(item.dateISO).toLocaleDateString('pt-PT', { weekday: 'short' })}
              </Text>
              {/* Mostra a data se não for hoje/amanhã para contexto */}
              <Text fontSize={10} opacity={0.5} numberOfLines={1}>
                {item.dateISO.slice(5)}
              </Text>
            </YStack>

            <Separator vertical height={40} />

            <YStack flex={1} gap="$1">
              <H4 color="$color">{item.customerName}</H4>
              <XStack alignItems="center" gap="$2">
                <Car size={14} color={theme.color?.get()} opacity={0.7} />
                <Text opacity={0.8} color="$color">{item.vehicleLabel}</Text>
              </XStack>

              <XStack gap="$2" flexWrap="wrap" marginTop="$1">
                <Tag text={statusLabel(item.status)} />
                <Tag text={serviceLabel(item.serviceType)} />
              </XStack>
            </YStack>
          </XStack>

          <Button size="$3" chromeless onPress={onToggleExpanded}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </XStack>

        {/* Detalhes Expandidos */}
        {expanded && (
          <YStack gap="$2">
            <Separator />
            <Text opacity={0.85}>Data completa: {item.dateISO}</Text>
            {item.notes ? (
              <YStack gap="$1">
                <Text fontWeight="600" fontSize="$2" opacity={0.8}>Notas:</Text>
                <Text color="$color">{item.notes}</Text>
              </YStack>
            ) : (
              <Text opacity={0.6} fontStyle="italic">Sem notas adicionais.</Text>
            )}

            <XStack gap="$2" flexWrap="wrap" marginTop="$3">
              {item.status !== 'canceled' && item.status !== 'checked_in' && (
                <Button size="$3" theme="green" onPress={onCheckIn} icon={CheckCircle2}>
                  Check-in
                </Button>
              )}
              {item.status !== 'canceled' && item.status !== 'checked_in' && (
                <Button size="$3" theme="red" onPress={onCancel} icon={XCircle}>
                  Cancelar
                </Button>
              )}
              {item.status === 'checked_in' && (
                <Button size="$3" disabled opacity={0.5}>Check-in Realizado</Button>
              )}
            </XStack>
          </YStack>
        )}
      </YStack>
    </Card>
  )
}

export default function BookingsPage() {
  const insets = useSafeAreaInsets()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState<FilterDatePreset>('today')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  
  // Novo estado para a data customizada
  const [customDate, setCustomDate] = useState(todayISO)

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 600))
      setBookings(mockBookings)
    } catch (e: any) {
      setError('Não foi possível carregar as marcações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCreateMock = () => {
    const newId = `bk-${Date.now()}`
    // Se estiver a filtrar por data específica, cria nessa data, senão cria hoje
    const targetDate = filterDate === 'custom' ? customDate : todayISO
    
    const newBooking: Booking = {
      id: newId,
      dateISO: targetDate,
      time: '12:00',
      customerName: 'Novo Cliente (Demo)',
      vehicleLabel: 'Audi Demo (TESTE)',
      serviceType: 'repair',
      status: 'pending',
      notes: 'Criado via botão de teste.',
    }
    
    setBookings(prev => [newBooking, ...prev])
    
    if (Platform.OS === 'web') {
      alert(`Marcação criada para ${targetDate}!`)
    } else {
      RNAlert.alert('Sucesso', `Marcação criada para ${targetDate}!`)
    }
  }

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase()

    return bookings
      .filter((b) => {
        if (filterDate === 'today') return b.dateISO === todayISO
        if (filterDate === 'tomorrow') return b.dateISO === tomorrowISO
        if (filterDate === 'custom') return b.dateISO === customDate // Filtra pela data escolhida
        return true
      })
      .filter((b) => (filterStatus === 'all' ? true : b.status === filterStatus))
      .filter((b) => {
        if (!q) return true
        const hay = `${b.customerName} ${b.vehicleLabel} ${b.notes ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [bookings, search, filterDate, filterStatus, customDate])

  const handleCheckIn = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'checked_in' } : b))
    )
    if (Platform.OS !== 'web') RNAlert.alert('Sucesso', 'Check-in realizado.')
  }

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'canceled' } : b))
    )
  }

  const clearFilters = () => {
    setSearch('')
    setFilterDate('all')
    setFilterStatus('all')
    setCustomDate(todayISO)
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
                </XStack>
              </Button>

              <XStack gap="$2">
                <Button size="$3" onPress={fetchBookings} chromeless>
                  <RefreshCcw size={18} />
                </Button>
                <Button size="$3" theme="green" onPress={handleCreateMock} icon={Plus}>
                  Nova
                </Button>
              </XStack>
            </XStack>

            {/* Title */}
            <YStack gap="$1">
              <H2 color="$color">Marcações</H2>
              <Text opacity={0.8} color="$color">
                Visíveis: {filteredBookings.length}
              </Text>
            </YStack>

            {/* Filters */}
            <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$3">
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack gap="$2" alignItems="center" flex={1}>
                    <Text fontWeight="700" color="$color">Filtros</Text>
                    {filterDate === 'today' && <Tag text="Hoje" />}
                    {filterDate === 'tomorrow' && <Tag text="Amanhã" />}
                    {filterDate === 'custom' && <Tag text={customDate} />}
                    {filterDate === 'all' && <Tag text="Todas" />}
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
                        placeholder="Cliente, veículo..."
                        autoCapitalize="none"
                        backgroundColor="$gray3"
                      />
                    </YStack>

                    <Separator />

                    <YStack gap="$2">
                      <Text opacity={0.85} color="$color">Data</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack gap="$2" paddingVertical="$1">
                          <Chip label="Hoje" active={filterDate === 'today'} onPress={() => setFilterDate('today')} />
                          <Chip label="Amanhã" active={filterDate === 'tomorrow'} onPress={() => setFilterDate('tomorrow')} />
                          <Chip label="Outra Data" active={filterDate === 'custom'} onPress={() => setFilterDate('custom')} />
                          <Chip label="Todas" active={filterDate === 'all'} onPress={() => setFilterDate('all')} />
                        </XStack>
                      </ScrollView>

                      {/* Input de Data Personalizada (só aparece se 'Outra Data' estiver ativo) */}
                      {filterDate === 'custom' && (
                        <XStack gap="$2" alignItems="center" marginTop="$2" backgroundColor="$gray3" padding="$2" borderRadius="$4">
                          <CalendarDays size={20} color={theme.color?.get()} />
                          <Input
                            flex={1}
                            value={customDate}
                            onChangeText={setCustomDate}
                            placeholder="AAAA-MM-DD"
                            keyboardType="numeric" // Teclado numérico ajuda no telemóvel
                            borderWidth={0}
                            backgroundColor="transparent"
                          />
                        </XStack>
                      )}
                    </YStack>

                    <Separator />

                    <YStack gap="$2">
                      <Text opacity={0.85} color="$color">Estado</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack gap="$2" paddingVertical="$1">
                          <Chip label="Todos" active={filterStatus === 'all'} onPress={() => setFilterStatus('all')} />
                          <Chip label="Pendentes" active={filterStatus === 'pending'} onPress={() => setFilterStatus('pending')} />
                          <Chip label="Confirmadas" active={filterStatus === 'confirmed'} onPress={() => setFilterStatus('confirmed')} />
                        </XStack>
                      </ScrollView>
                    </YStack>

                    <XStack justifyContent="flex-end">
                      <Button size="$3" chromeless onPress={clearFilters}>Limpar filtros</Button>
                    </XStack>
                  </YStack>
                )}
              </YStack>
            </Card>

            {/* List */}
            {loading && (
              <YStack alignItems="center" gap="$2" padding="$4">
                <Spinner size="large" />
                <Text color="$color">A carregar agenda...</Text>
              </YStack>
            )}

            {!loading && !error && (
              <YStack gap="$3">
                {filteredBookings.length === 0 ? (
                  <Card elevate padded backgroundColor="$gray2">
                    <Text color="$color">
                      Nenhuma marcação encontrada 
                      {filterDate === 'custom' ? ` para ${customDate}` : ''}.
                    </Text>
                    {filterDate === 'custom' && (
                       <Text fontSize={12} opacity={0.7} textAlign="center" marginTop="$2">
                         Dica: Verifica se o formato é AAAA-MM-DD (ex: 2026-01-22)
                       </Text>
                    )}
                  </Card>
                ) : (
                  filteredBookings.map((b) => (
                    <BookingCard
                      key={b.id}
                      item={b}
                      expanded={expandedId === b.id}
                      onToggleExpanded={() => setExpandedId((prev) => (prev === b.id ? null : b.id))}
                      onCheckIn={() => handleCheckIn(b.id)}
                      onCancel={() => handleCancel(b.id)}
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