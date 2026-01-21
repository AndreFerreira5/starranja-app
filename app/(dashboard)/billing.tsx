import { useEffect, useMemo, useState } from 'react'
import { Alert as RNAlert } from 'react-native'
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
  FileText,
  Receipt,
  Euro,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Ban,
} from 'lucide-react-native'

type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'canceled'

type BillingInvoice = {
  id: string
  number: string
  createdAtISO: string
  customerName: string
  vehicleLabel?: string
  workOrderId?: string
  workOrderNumber?: number
  status: InvoiceStatus
  subtotal: number
  vat: number
  total: number
  paymentMethod?: string
  notes?: string
}

type FilterStatus = 'all' | InvoiceStatus
type PeriodPreset = 'this_month' | 'last_month' | 'custom'

// ---------- helpers ----------
const euro = (v: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v)

function statusLabel(s: InvoiceStatus) {
  switch (s) {
    case 'draft':
      return 'Rascunho'
    case 'issued':
      return 'Emitida'
    case 'paid':
      return 'Paga'
    case 'canceled':
      return 'Anulada'
    default:
      return '—'
  }
}

function statusRank(s: InvoiceStatus) {
  switch (s) {
    case 'issued':
      return 4
    case 'draft':
      return 3
    case 'paid':
      return 2
    case 'canceled':
      return 1
    default:
      return 0
  }
}

function statusIcon(s: InvoiceStatus) {
  switch (s) {
    case 'paid':
      return CheckCircle2
    case 'issued':
      return Clock3
    case 'draft':
      return FileText
    case 'canceled':
      return Ban
    default:
      return Receipt
  }
}

function statusColor(theme: any, s: InvoiceStatus) {
  switch (s) {
    case 'paid':
      return theme.green10?.get?.() ?? 'green'
    case 'issued':
      return theme.orange10?.get?.() ?? 'orange'
    case 'draft':
      return theme.blue10?.get?.() ?? 'dodgerblue'
    case 'canceled':
      return theme.red10?.get?.() ?? 'red'
    default:
      return theme.color?.get?.() ?? '#999'
  }
}

// ---------- mock data ----------
const now = new Date()
const iso = (d: Date) => d.toISOString()

const mockInvoices: BillingInvoice[] = [
  {
    id: 'inv-001',
    number: 'FT 2026/0001',
    createdAtISO: iso(new Date(now.getFullYear(), now.getMonth(), 4, 10, 30)),
    customerName: 'João Silva',
    vehicleLabel: 'BMW 320d (AA-00-AA)',
    workOrderId: 'wo-1001',
    workOrderNumber: 12,
    status: 'issued',
    subtotal: 180,
    vat: 41.4,
    total: 221.4,
    paymentMethod: '—',
    notes: 'A aguardar pagamento.',
  },
  {
    id: 'inv-002',
    number: 'FT 2026/0002',
    createdAtISO: iso(new Date(now.getFullYear(), now.getMonth(), 8, 16, 10)),
    customerName: 'Maria Costa',
    vehicleLabel: 'Renault Clio (BB-11-BB)',
    workOrderId: 'wo-0999',
    workOrderNumber: 7,
    status: 'paid',
    subtotal: 95,
    vat: 21.85,
    total: 116.85,
    paymentMethod: 'MB',
  },
  {
    id: 'inv-003',
    number: 'FT 2026/0003',
    createdAtISO: iso(new Date(now.getFullYear(), now.getMonth(), 10, 9, 5)),
    customerName: 'Pedro Almeida',
    vehicleLabel: 'Audi A3 (CC-22-CC)',
    workOrderId: 'wo-1010',
    workOrderNumber: 20,
    status: 'draft',
    subtotal: 0,
    vat: 0,
    total: 0,
    notes: 'Rascunho (ex.: FO ainda não concluída).',
  },
  {
    id: 'inv-004',
    number: 'FT 2026/0004',
    createdAtISO: iso(new Date(now.getFullYear(), now.getMonth(), 2, 12, 40)),
    customerName: 'Ana Rocha',
    vehicleLabel: 'Opel Corsa (DD-33-DD)',
    workOrderId: 'wo-0980',
    workOrderNumber: 3,
    status: 'canceled',
    subtotal: 120,
    vat: 27.6,
    total: 147.6,
    notes: 'Anulada por correção.',
  },
]

// ---------- UI ----------
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

const Tag = ({ text }: { text: string }) => (
  <Card paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" backgroundColor="$gray4">
    <Text fontSize="$2" opacity={0.9}>
      {text}
    </Text>
  </Card>
)

const MetricCard = ({
  title,
  value,
  icon,
  width,
}: {
  title: string
  value: string
  icon: any
  width: string
}) => {
  const theme = useTheme()
  const Icon = icon

  return (
    <Card
      elevate
      padded
      width={width as any}
      backgroundColor="$gray2"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack alignItems="center" justifyContent="space-between" gap="$3">
        <YStack flex={1} minWidth={0}>
          <Text opacity={0.8} numberOfLines={1}>
            {title}
          </Text>
          <H4 color="$color" numberOfLines={1}>
            {value}
          </H4>
        </YStack>
        <Icon size={20} color={theme.orange?.get() ?? 'orange'} />
      </XStack>
    </Card>
  )
}

const InvoiceCard = ({
  inv,
  expanded,
  onToggleExpanded,
  onView,
  onExport,
  onTogglePaid,
}: {
  inv: BillingInvoice
  expanded: boolean
  onToggleExpanded: () => void
  onView: () => void
  onExport: () => void
  onTogglePaid: () => void
}) => {
  const theme = useTheme()
  const Icon = statusIcon(inv.status)
  const sColor = statusColor(theme, inv.status)

  return (
    <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
      <YStack gap="$3">
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <XStack flex={1} gap="$3" alignItems="flex-start">
            <Icon size={20} color={sColor} />
            <YStack flex={1} gap="$1">
              <H4 color="$color">{inv.number}</H4>
              <Text opacity={0.8} color="$color">
                {inv.customerName}
                {inv.vehicleLabel ? ` · ${inv.vehicleLabel}` : ''}
              </Text>

              <XStack gap="$2" flexWrap="wrap" marginTop="$1">
                <Tag text={statusLabel(inv.status)} />
                {typeof inv.workOrderNumber === 'number' && <Tag text={`FO #${inv.workOrderNumber}`} />}
                <Tag text={`Total: ${euro(inv.total)}`} />
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
              Data: {new Date(inv.createdAtISO).toLocaleString('pt-PT')}
            </Text>
            <Text opacity={0.85} color="$color">
              Subtotal: {euro(inv.subtotal)} · IVA: {euro(inv.vat)} · Total: {euro(inv.total)}
            </Text>
            {inv.paymentMethod && (
              <Text opacity={0.85} color="$color">
                Pagamento: {inv.paymentMethod}
              </Text>
            )}
            {inv.notes && <Text opacity={0.8}>{inv.notes}</Text>}

            <XStack gap="$2" flexWrap="wrap" marginTop="$2">
              <Button size="$3" onPress={onView}>
                Ver fatura
              </Button>
              <Button size="$3" chromeless onPress={onExport}>
                Exportar PDF
              </Button>

              {inv.status !== 'canceled' && (
                <Button size="$3" theme={inv.status === 'paid' ? 'gray' : 'green'} onPress={onTogglePaid}>
                  {inv.status === 'paid' ? 'Marcar não paga' : 'Marcar paga'}
                </Button>
              )}
            </XStack>
          </YStack>
        )}
      </YStack>
    </Card>
  )
}

export default function BillingPage() {

  const insets = useSafeAreaInsets()

  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [invoices, setInvoices] = useState<BillingInvoice[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Começa fechado (menos ruído visual no mobile)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_month')
  const [monthText, setMonthText] = useState<string>(String(now.getMonth() + 1))
  const [yearText, setYearText] = useState<string>(String(now.getFullYear()))

  const resolvedPeriod = useMemo(() => {
    const y = Number.parseInt(yearText, 10)
    const m = Number.parseInt(monthText, 10)

    const validY = Number.isFinite(y) ? y : now.getFullYear()
    const validM = Number.isFinite(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1

    if (periodPreset === 'this_month') {
      return { year: now.getFullYear(), month: now.getMonth() + 1 }
    }
    if (periodPreset === 'last_month') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    }
    return { year: validY, month: validM }
  }, [periodPreset, monthText, yearText])

  const fetchBilling = async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 600))
      setInvoices(mockInvoices)
    } catch (e: any) {
      setError('Não foi possível carregar a faturação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBilling()
  }, [])

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase()

    return invoices
      .filter((inv) => {
        const d = new Date(inv.createdAtISO)
        return d.getFullYear() === resolvedPeriod.year && d.getMonth() + 1 === resolvedPeriod.month
      })
      .filter((inv) => (filterStatus === 'all' ? true : inv.status === filterStatus))
      .filter((inv) => {
        if (!q) return true
        const hay = `${inv.number} ${inv.customerName} ${inv.vehicleLabel ?? ''} ${inv.workOrderId ?? ''} ${
          typeof inv.workOrderNumber === 'number' ? inv.workOrderNumber : ''
        }`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => {
        const sr = statusRank(b.status) - statusRank(a.status)
        if (sr !== 0) return sr
        return b.createdAtISO.localeCompare(a.createdAtISO)
      })
  }, [invoices, search, filterStatus, resolvedPeriod])

  const metrics = useMemo(() => {
    const valid = filteredInvoices.filter((i) => i.status !== 'canceled')
    const totalMonth = valid.reduce((acc, i) => acc + i.total, 0)
    const paid = valid.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.total, 0)
    const outstanding = valid.filter((i) => i.status === 'issued').reduce((acc, i) => acc + i.total, 0)
    return { totalMonth, paid, outstanding, count: filteredInvoices.length }
  }, [filteredInvoices])

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('all')
    setPeriodPreset('this_month')
    setMonthText(String(now.getMonth() + 1))
    setYearText(String(now.getFullYear()))
  }

  const togglePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv
        if (inv.status === 'canceled') return inv
        if (inv.status === 'paid') return { ...inv, status: 'issued', paymentMethod: '—' }
        return {
          ...inv,
          status: 'paid',
          paymentMethod: inv.paymentMethod && inv.paymentMethod !== '—' ? inv.paymentMethod : 'MB',
        }
      })
    )
  }

  const handleViewInvoice = (inv: BillingInvoice) => {
    RNAlert.alert('Ver fatura', `${inv.number}\nEm desenvolvimento.`)
  }

  const handleExportInvoice = (inv: BillingInvoice) => {
    RNAlert.alert('Exportar PDF', `${inv.number}\nEm desenvolvimento.`)
  }

  const periodLabel = `${String(resolvedPeriod.month).padStart(2, '0')}/${resolvedPeriod.year}`

  return (
    <SafeAreaView
    style={{ flex: 1, backgroundColor: theme.background?.get() as any }}
    edges={['top', 'left', 'right']}
    >
    <ScrollView backgroundColor="$background">
      {/* paddingBottom reforçado para não ficar tapado pela tab bar/gestos */}
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

            <Button size="$3" onPress={fetchBilling}>
              <XStack gap="$2" alignItems="center">
                <RefreshCcw size={18} />
                <Text>Atualizar</Text>
              </XStack>
            </Button>
          </XStack>

          {/* Title */}
          <YStack gap="$1">
            <H2 color="$color">Faturação</H2>
            <Text opacity={0.8} color="$color">
              Período: {periodLabel} · Itens: {metrics.count}
            </Text>
          </YStack>

          {/* Metrics grid (2 + 1) */}
          <YStack gap="$2">
            <XStack gap="$2" flexWrap="wrap">
              <MetricCard title="Total do mês" value={euro(metrics.totalMonth)} icon={Euro} width="49%" />
              <MetricCard title="Pago" value={euro(metrics.paid)} icon={CheckCircle2} width="49%" />
              <MetricCard title="Por receber" value={euro(metrics.outstanding)} icon={Receipt} width="100%" />
            </XStack>
          </YStack>

          {/* Filters */}
          <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <XStack gap="$2" alignItems="center" flex={1}>
                  <Text fontWeight="700" color="$color">
                    Filtros
                  </Text>
                  <Tag text={periodLabel} />
                  {filterStatus !== 'all' && <Tag text={statusLabel(filterStatus)} />}
                </XStack>

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
                      placeholder="Nº fatura, cliente, FO..."
                      autoCapitalize="none"
                      backgroundColor="$gray3"
                    />
                  </YStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Período
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <XStack gap="$2" paddingVertical="$1">
                        <Chip label="Este mês" active={periodPreset === 'this_month'} onPress={() => setPeriodPreset('this_month')} />
                        <Chip label="Mês anterior" active={periodPreset === 'last_month'} onPress={() => setPeriodPreset('last_month')} />
                        <Chip label="Custom" active={periodPreset === 'custom'} onPress={() => setPeriodPreset('custom')} />
                      </XStack>
                    </ScrollView>

                    {periodPreset === 'custom' && (
                      <XStack gap="$2" alignItems="center">
                        <CalendarRange size={18} color={theme.color?.get()} />
                        <Input
                          flex={1}
                          value={monthText}
                          onChangeText={setMonthText}
                          placeholder="Mês (1-12)"
                          keyboardType="numeric"
                          backgroundColor="$gray3"
                        />
                        <Input
                          flex={1}
                          value={yearText}
                          onChangeText={setYearText}
                          placeholder="Ano"
                          keyboardType="numeric"
                          backgroundColor="$gray3"
                        />
                      </XStack>
                    )}
                  </YStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text opacity={0.85} color="$color">
                      Estado
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <XStack gap="$2" paddingVertical="$1">
                        <Chip label="Todos" active={filterStatus === 'all'} onPress={() => setFilterStatus('all')} />
                        <Chip label="Emitida" active={filterStatus === 'issued'} onPress={() => setFilterStatus('issued')} />
                        <Chip label="Paga" active={filterStatus === 'paid'} onPress={() => setFilterStatus('paid')} />
                        <Chip label="Rascunho" active={filterStatus === 'draft'} onPress={() => setFilterStatus('draft')} />
                        <Chip label="Anulada" active={filterStatus === 'canceled'} onPress={() => setFilterStatus('canceled')} />
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

          {/* Content states */}
          {loading && (
            <YStack alignItems="center" gap="$2" padding="$4">
              <Spinner size="large" />
              <Text color="$color">A carregar faturação...</Text>
            </YStack>
          )}

          {!loading && error && (
            <Card elevate padded borderWidth={1} borderColor="$red10" backgroundColor="$gray2">
              <Text color="$color">{error}</Text>
              <XStack marginTop="$3">
                <Button onPress={fetchBilling}>Tentar novamente</Button>
              </XStack>
            </Card>
          )}

          {!loading && !error && (
            <YStack gap="$3">
              {filteredInvoices.length === 0 ? (
                <Card elevate padded backgroundColor="$gray2">
                  <Text color="$color">Sem faturas para o período/filtros selecionados.</Text>
                </Card>
              ) : (
                filteredInvoices.map((inv) => (
                  <InvoiceCard
                    key={inv.id}
                    inv={inv}
                    expanded={expandedId === inv.id}
                    onToggleExpanded={() => setExpandedId((prev) => (prev === inv.id ? null : inv.id))}
                    onView={() => handleViewInvoice(inv)}
                    onExport={() => handleExportInvoice(inv)}
                    onTogglePaid={() => togglePaid(inv.id)}
                  />
                ))
              )}
            </YStack>
          )}

          {/* Nota (placeholder) */}
          <Card elevate padded backgroundColor="$gray2" borderWidth={1} borderColor="$borderColor">
            <XStack gap="$3" alignItems="center">
              <Receipt size={18} color={theme.orange?.get() ?? 'orange'} />
              <Text opacity={0.85} color="$color">
                Em produção: emitir fatura/PDF e validações (ex.: não emitir antes de concluir a FO).
              </Text>
            </XStack>
          </Card>
        </YStack>
      </YStack>
    </ScrollView>
  </SafeAreaView>
  )
}
