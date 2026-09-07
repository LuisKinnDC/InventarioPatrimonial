import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Spinner } from '@/components/ui'
import { ESTADO_CONSERVACION_LABEL, type EstadoConservacion } from '@/types/database'

interface Valorizacion {
  bienes_activos: number
  bienes_baja: number
  unidades_activas: number
  valor_total_activo: number
}
interface FilaAgg {
  estado?: string
  ubicacion?: string
  nivel?: string
  total_bienes: number
  total_unidades: number
  valor_total: number
}

const COLORS = ['#059669', '#d97706', '#e11d48', '#64748b', '#0051d5', '#00236f']

const soles = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n ?? 0)

function useVista<T>(vista: string, key: string) {
  return useQuery({
    queryKey: [key],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(vista).select('*')
      if (error) throw error
      return (data ?? []) as T[]
    },
  })
}

export function DashboardPage() {
  const { data: totales } = useQuery({
    queryKey: ['valorizacion'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<Valorizacion | null> => {
      const { data, error } = await supabase.from('v_valorizacion').select('*').single()
      if (error) throw error
      return data as Valorizacion
    },
  })
  const porEstado = useVista<FilaAgg>('v_dashboard_estado', 'dash-estado')
  const porUbicacion = useVista<FilaAgg>('v_dashboard_ubicacion', 'dash-ubicacion')
  const porNivel = useVista<FilaAgg>('v_dashboard_nivel', 'dash-nivel')

  const dataEstado = (porEstado.data ?? []).map((r) => ({
    nombre: ESTADO_CONSERVACION_LABEL[r.estado as EstadoConservacion] ?? r.estado ?? 'S/E',
    value: r.total_bienes,
  }))
  const dataUbicacion = (porUbicacion.data ?? []).slice(0, 10).map((r) => ({
    nombre: r.ubicacion ?? 'S/U',
    bienes: r.total_bienes,
  }))
  const dataNivel = (porNivel.data ?? []).map((r) => ({
    nombre: r.nivel ?? 'S/N',
    bienes: r.total_bienes,
  }))

  return (
    <div>
      <PageHeader
        icon="monitoring"
        title="Dashboard Directivo"
        badge="TIEMPO REAL"
        subtitle="Indicadores del patrimonio institucional para la toma de decisiones"
      />

      {!supabaseConfigurado && <AvisoSupabase />}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon="inventory_2" label="Bienes activos" value={totales?.bienes_activos ?? '—'} color="primary" />
        <Kpi icon="numbers" label="Unidades activas" value={totales?.unidades_activas ?? '—'} color="sky" />
        <Kpi
          icon="payments"
          label="Valorización total"
          value={totales ? soles(totales.valor_total_activo) : '—'}
          color="emerald"
        />
        <Kpi icon="delete_sweep" label="Bienes de baja" value={totales?.bienes_baja ?? '—'} color="rose" />
      </div>

      <div className="mt-space-md grid grid-cols-1 gap-space-md lg:grid-cols-2">
        <Panel titulo="Estado de conservación" icon="donut_small">
          {porEstado.isLoading ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dataEstado} dataKey="value" nameKey="nombre" cx="50%" cy="50%" outerRadius={90} label>
                  {dataEstado.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel titulo="Bienes por nivel educativo" icon="school">
          {porNivel.isLoading ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataNivel}>
                <XAxis dataKey="nombre" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bienes" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel titulo="Top 10 ambientes por cantidad de bienes" icon="location_on" ancho>
          {porUbicacion.isLoading ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dataUbicacion} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="nombre" type="category" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="bienes" fill="#0051d5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>
    </div>
  )
}

const KPI_COLORS: Record<string, string> = {
  primary: 'bg-primary text-on-primary',
  emerald: 'bg-emerald-50 text-emerald-900',
  sky: 'bg-sky-50 text-sky-900',
  rose: 'bg-rose-50 text-rose-900',
}

function Kpi({
  icon,
  label,
  value,
  color,
}: {
  icon: string
  label: string
  value: string | number
  color: keyof typeof KPI_COLORS
}) {
  const destacado = color === 'primary'
  return (
    <div className={`flex items-center justify-between rounded-xl p-space-lg shadow-sm ${KPI_COLORS[color]}`}>
      <div>
        <p className={`font-label-sm text-label-sm uppercase tracking-wide ${destacado ? 'opacity-80' : 'opacity-70'}`}>
          {label}
        </p>
        <p className="mt-space-2xs font-headline-lg text-headline-lg font-bold">{value}</p>
      </div>
      <Icon name={icon} className="text-3xl opacity-50" />
    </div>
  )
}

function Panel({
  titulo,
  icon,
  children,
  ancho,
}: {
  titulo: string
  icon: string
  children: React.ReactNode
  ancho?: boolean
}) {
  return (
    <div className={`rounded-xl bg-surface-container-lowest shadow-sm ${ancho ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-center gap-space-sm border-b border-outline-variant/40 px-space-md py-space-sm">
        <Icon name={icon} className="text-primary text-lg" />
        <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">{titulo}</h3>
      </div>
      <div className="p-space-md">{children}</div>
    </div>
  )
}

function AvisoSupabase() {
  return (
    <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
      <Icon name="warning" className="text-lg" />
      Conecta Supabase y aplica las migraciones para ver los indicadores.
    </div>
  )
}
