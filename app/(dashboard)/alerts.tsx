import { useEffect, useMemo, useState } from 'react'
import { Alert as RNAlert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  Clock,
  Package,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native'

type AlertSeverity = 'low' | 'medium' | 'high'
type AlertType = 'fo_stalled' | 'pending_parts' | 'booking_today' | 'vehicle_ready'
type AlertStatus = 'open' | 'resolved'

type DashboardAlert = {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description?: string
  createdAtISO: string
  workOrderId?: string
  workOrderNumber?: number
  daysStalled?: number
  supplierOrderId?: string
}

type FilterType = 'all' | AlertType
type FilterStatus = 'all' | AlertStatus

const nowISO = () => new Date().toISOString()

// Mock data (frontend-only)
const mockAlerts: DashboardAlert[] = [
  {
    id: 'al-001',
    type: 'fo_stalled',
    severity: 'high',
    status: 'open',
    title: 'FO parada há 9 dias',
    description: 'Verificar aprovação de orçamento e/ou dependências (peças/diagnóstico).',
    createdAtISO: nowISO(),
    workOrderId: 'wo-1001',
    workOrderNumber: 12,
    daysStalled: 9,
  },
  {
    id: 'al-002',
    type: 'pending_parts',
    severity: 'medium',
    status: 'open',
    title: 'Peças pendentes (encomenda em atraso)',
    description: 'Fornecedor ainda não confirmou expedição.',
    createdAtISO: nowISO(),
    supplierOrderId: 'po-501',
    workOrderId: 'wo-1004',
    workOrderNumber: 18,
  },
  {
    id: 'al-003',
    type: 'booking_today',
    severity: 'low',
    status: 'open',
    title: 'Marcação hoje: 2 check-ins pendentes',
    description: 'Rever agenda para evitar atrasos no fluxo de receção.',
    createdAtISO: nowISO(),
  },
  {
    id: 'al-004',
    type: 'vehicle_ready',
    severity: 'medium',
    status: 'resolved',
    title: 'Veículo pronto (notificação já enviada)',
    description: 'FO concluída; notificação ao cliente efetuada.',
    createdAtISO: nowISO(),
    workOrderId: 'wo-0999',
    workOrderNumber: 7,
  },
]

function typeLabel(t: AlertType) {
  switch (t) {
    case 'fo_stalled':
      return 'FO parada'
    case 'pending_parts':
      return 'Peças pendentes'
    case 'booking_today':
      return 'Marcação'
    case 'vehicle_ready':
      return 'Veículo pronto'
    default:
      return 'Alerta'
  }
}

function severityLabel(s: AlertSeverity) {
  switch (s) {
    case 'high':
      return 'Alta'
    case 'medium':
      return 'Média'
    case 'low':
      return 'Baixa'
    default:
      return '—'
  }
}

function severityRank(s: AlertSeverity) {
  switch (s) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

function getIconForType(t: AlertType) {
  switch (t) {
    case 'fo_stalled':
      return Clock
    case 'pending_parts':
      return Package
    case 'booking_today':
      return Calendar
    case 'vehicle_ready':
      return CheckCircle2
    default:
      return AlertTriangle
  }
}

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) => {
  return (
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
}

const Tag = ({ text }: { text: string }) => (
  <Card paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" backgroundColor="$gray4">
    <Text fontSize="$2" opacity={0.9}>
      {text}
    </Text>
  </Card>
)

const AlertCard = ({
  item,
  expanded,
  onToggleExpanded,
  onToggleResolved,
  onOpenRelated,
}: {
  item: DashboardAlert
  expanded: boolean
  onToggleExpanded: () => void
  onToggleResolved: () => void
  onOpenRelated: () => void
}) => {
  const theme = useTheme()
  const Icon = getIconForType(item.type)

  const borderColor =
    item.severity === 'high'
      ? theme.red10?.get() ?? 'red'
      : item.severity === 'medium'
        ? theme.orange10?.get() ?? 'orange'
        : theme.blue10?.get() ?? 'dodgerblue'

  const resolvedStyle = item.status === 'resolved' ? { opacity: 0.75 } : undefined

  return (
    <Card elevate padded borderWidth={1} borderColor={borderColor} style={resolvedStyle as any}>
      <YStack gap="$3">
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <XStack flex={1} gap="$3" alignItems="flex-start">
            <Icon size={20} color={borderColor} />
            <YStack flex={1} gap="$2">
              <H4 color="$color">{item.title}</H4>

              <XStack gap="$2" flexWrap="wrap">
                <Tag text={typeLabel(item.type)} />
                <Tag text={`Severidade: ${severityLabel(item.severity)}`} />
                <Tag text={item.status === 'open' ? 'Aberto' : 'Resolvido'} />
              </XStack>
            </YStack>
          </XStack>

          <Button size="$3" chromeless onPress={onToggleExpanded}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </XStack>

        {expanded && (
          <YStack gap="$2">
            {item.description ? (
              <Text color="$color">{item.description}</Text>
            ) : (
              <Text opacity={0.75}>Sem detalhes.</Text>
            )}

            {(item.workOrderId || typeof item.workOrderNumber === 'number') && (
              <Text opacity={0.85}>
                FO: {typeof item.workOrderNumber === 'number' ? `#${item.workOrderNumber}` : '—'}
                {item.workOrderId ? ` (${item.workOrderId})` : ''}
              </Text>
            )}

            {typeof item.daysStalled === 'number' && (
              <Text opacity={0.85}>Dias parada: {item.daysStalled}</Text>
            )}

            {item.supplierOrderId && (
              <Text opacity={0.85}>Encomenda fornecedor: {item.supplierOrderId}</Text>
            )}

            <XStack gap="$2" flexWrap="wrap" marginTop="$2">
              <Button size="$3" onPress={onOpenRelated}>
                Ver contexto
              </Button>

              <Button
                size="$3"
                theme={item.status === 'open' ? 'green' : 'gray'}
                onPress={onToggleResolved}
              >
                {item.status === 'open' ? 'Marcar resolvido' : 'Reabrir'}
              </Button>
            </XStack>
          </YStack>
        )}
      </YStack>
    </Card>
  )
}

export default function AlertsPage() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [filtersOpen, setFiltersOpen] = useState(true)

  // Filters
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('open')
  const [search, setSearch] = useState('')

  // Threshold for stalled work-orders
  const [stalledThresholdDaysText, setStalledThresholdDaysText] = useState('7')

  const stalledThresholdDays = useMemo(() => {
    const n = Number.parseInt(stalledThresholdDaysText, 10)
    return Number.isFinite(n) && n >= 0 ? n : 7
  }, [stalledThresholdDaysText])

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((r) => setTimeout(r, 600))
      setAlerts(mockAlerts)
    } catch (e: any) {
      setError('Não foi possível carregar os alertas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const counts = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length
    const resolved = alerts.filter((a) => a.status === 'resolved').length
    return { open, resolved, total: alerts.length }
  }, [alerts])

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase()

    return alerts
      .filter((a) => (filterType === 'all' ? true : a.type === filterType))
      .filter((a) => (filterStatus === 'all' ? true : a.status === filterStatus))
      .filter((a) => {
        if (!q) return true
        const hay = `${a.title} ${a.description ?? ''} ${a.workOrderId ?? ''} ${
          typeof a.workOrderNumber === 'number' ? a.workOrderNumber : ''
        } ${a.supplierOrderId ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .filter((a) => {
        if (a.type !== 'fo_stalled') return true
        if (typeof a.daysStalled !== 'number') return true
        return a.daysStalled >= stalledThresholdDays
      })
      .sort((a, b) => {
        const sev = severityRank(b.severity) - severityRank(a.severity)
        if (sev !== 0) return sev

        const st = (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1)
        if (st !== 0) return st

        return a.id.localeCompare(b.id)
      })
  }, [alerts, filterType, filterStatus, search, stalledThresholdDays])

  const handleToggleResolved = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'open' ? 'resolved' : 'open' } : a
      )
    )
  }

  const handleOpenRelated = (a: DashboardAlert) => {
    // Placeholder (sem backend/rotas definitivas)
    if (a.workOrderId || typeof a.workOrderNumber === 'number') {
      RNAlert.alert(
        'Abrir contexto',
        `Abrir FO ${typeof a.workOrderNumber === 'number' ? `#${a.workOrderNumber}` : ''} ${
          a.workOrderId ? `(${a.workOrderId})` : ''
        }`
      )
      return
    }
    RNAlert.alert('Abrir contexto', 'Em desenvolvimento.')
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterStatus('open')
    setSearch('')
    setStalledThresholdDaysText('7')
  }

  return (
    <ScrollView backgroundColor="$background">
      <YStack paddingTop={insets.top} paddingBottom={insets.bottom} paddingHorizontal="$4">
        <YStack width="100%" maxWidth={520} alignSelf="center" gap="$4" paddingVertical="$4">
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

            <Button size="$3" onPress={fetchAlerts}>
              <XStack gap="$2" alignItems="center">
                <RefreshCcw size={18} />
                <Text>Atualizar</Text>
              </XStack>
            </Button>
          </XStack>

          {/* Title */}
          <YStack gap="$1">
            <H2 color="$color">Alertas</H2>
            <Text opacity={0.8} color="$color">
              Abertos: {counts.open} · Resolvidos: {counts.resolved} · Total: {counts.total}
            </Text>
          </YStack>

          {/* Filters */}
          <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="700" color="$color">
                  Filtros
                </Text>
                <Button size="$3" chromeless onPress={() => setFiltersOpen((v) => !v)}>
                  {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
              </XStack>

              {filtersOpen && (
                <YStack gap="$3">
                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Pesquisar
                    </Text>
                    <Input
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Título, FO, encomenda..."
                      autoCapitalize="none"
                      backgroundColor="$gray3"
                    />
                  </YStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Tipo
                    </Text>

                    {/* Horizontal chips for mobile */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <XStack gap="$2" paddingVertical="$1">
                        <Chip label="Todos" active={filterType === 'all'} onPress={() => setFilterType('all')} />
                        <Chip
                          label="FO parada"
                          active={filterType === 'fo_stalled'}
                          onPress={() => setFilterType('fo_stalled')}
                        />
                        <Chip
                          label="Peças pendentes"
                          active={filterType === 'pending_parts'}
                          onPress={() => setFilterType('pending_parts')}
                        />
                        <Chip
                          label="Marcação"
                          active={filterType === 'booking_today'}
                          onPress={() => setFilterType('booking_today')}
                        />
                        <Chip
                          label="Veículo pronto"
                          active={filterType === 'vehicle_ready'}
                          onPress={() => setFilterType('vehicle_ready')}
                        />
                      </XStack>
                    </ScrollView>
                  </YStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Estado
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <XStack gap="$2" paddingVertical="$1">
                        <Chip label="Abertos" active={filterStatus === 'open'} onPress={() => setFilterStatus('open')} />
                        <Chip
                          label="Resolvidos"
                          active={filterStatus === 'resolved'}
                          onPress={() => setFilterStatus('resolved')}
                        />
                        <Chip label="Todos" active={filterStatus === 'all'} onPress={() => setFilterStatus('all')} />
                      </XStack>
                    </ScrollView>
                  </YStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Limiar para FO paradas (dias)
                    </Text>
                    <Input
                      value={stalledThresholdDaysText}
                      onChangeText={setStalledThresholdDaysText}
                      placeholder="Ex: 7"
                      keyboardType="numeric"
                      backgroundColor="$gray3"
                    />
                    <Text opacity={0.7} color="$color">
                      Apenas afeta alertas do tipo “FO parada”.
                    </Text>
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

          {/* Content states */}
          {loading && (
            <YStack alignItems="center" gap="$2" padding="$4">
              <Spinner size="large" />
              <Text color="$color">A carregar alertas...</Text>
            </YStack>
          )}

          {!loading && error && (
            <Card elevate padded borderWidth={1} borderColor="$red10" backgroundColor="$gray2">
              <Text color="$color">{error}</Text>
              <XStack marginTop="$3">
                <Button onPress={fetchAlerts}>Tentar novamente</Button>
              </XStack>
            </Card>
          )}

          {!loading && !error && (
            <YStack gap="$3">
              {filteredAlerts.length === 0 ? (
                <Card elevate padded backgroundColor="$gray2">
                  <Text color="$color">Nenhum alerta corresponde aos filtros atuais.</Text>
                </Card>
              ) : (
                filteredAlerts.map((a) => (
                  <AlertCard
                    key={a.id}
                    item={a}
                    expanded={expandedId === a.id}
                    onToggleExpanded={() => setExpandedId((prev) => (prev === a.id ? null : a.id))}
                    onToggleResolved={() => handleToggleResolved(a.id)}
                    onOpenRelated={() => handleOpenRelated(a)}
                  />
                ))
              )}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
