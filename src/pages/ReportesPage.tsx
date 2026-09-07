import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Button, Field, Select } from '@/components/ui'
import {
  useCategorias,
  useInstitucion,
  useNiveles,
  useUbicaciones,
} from '@/data/catalogos'
import { useFirmas } from '@/data/firmas'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import { exportarAnexo05Excel } from '@/lib/exportExcel'
import { exportarAnexo05Pdf } from '@/lib/exportPdf'
import {
  ESTADO_CONSERVACION_LABEL,
  type EstadoConservacion,
  type PadronActivoRow,
} from '@/types/database'

export function ReportesPage() {
  const { data: ubicaciones = [] } = useUbicaciones()
  const { data: categorias = [] } = useCategorias()
  const { data: institucion = null } = useInstitucion()
  const { data: firmas = [] } = useFirmas()
  const { data: niveles = [] } = useNiveles()

  const [ubicacion, setUbicacion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')
  const [nivel, setNivel] = useState('')
  const [generando, setGenerando] = useState<'excel' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const consultarPadron = async (): Promise<PadronActivoRow[]> => {
    let q = supabase.from('v_padron_activo').select('*')
    if (ubicacion) q = q.eq('ubicacion', ubicacion)
    if (categoria) q = q.eq('categoria', categoria)
    if (estado) q = q.eq('estado_conservacion', estado)
    if (nivel) q = q.eq('nivel', nivel)
    q = q.order('codigo_interno', { ascending: true, nullsFirst: false })
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as PadronActivoRow[]
  }

  const exportar = async (formato: 'excel' | 'pdf') => {
    setError(null)
    setGenerando(formato)
    try {
      const filas = await consultarPadron()
      if (filas.length === 0) {
        setError('No hay bienes que coincidan con los filtros seleccionados.')
        return
      }
      if (formato === 'excel') {
        await exportarAnexo05Excel(filas, institucion, firmas)
      } else {
        await exportarAnexo05Pdf(filas, institucion, firmas)
      }
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setGenerando(null)
    }
  }

  return (
    <div>
      <PageHeader
        icon="description"
        title="Reportes"
        subtitle="Exporta el inventario a Excel o PDF con las firmas configuradas"
      />

      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para generar reportes.
        </div>
      )}

      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="mb-space-md flex items-center gap-space-xs">
          <Icon name="filter_alt" className="text-primary text-lg" />
          <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
            Filtros de impresión
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Ambiente / Ubicación">
            <Select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <option value="">Todos los ambientes</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.nombre_ambiente}>
                  {u.nombre_ambiente}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Categoría">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estado de conservación">
            <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {(['B', 'R', 'M', 'Y'] as EstadoConservacion[]).map((e) => (
                <option key={e} value={e}>
                  {ESTADO_CONSERVACION_LABEL[e]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nivel educativo">
            <Select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="">Todos los niveles</option>
              {niveles.map((n) => (
                <option key={n.id} value={n.nombre}>
                  {n.nombre}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {error && (
          <p className="mt-space-md flex items-center gap-space-xs rounded-lg bg-rose-50 p-space-sm font-body-sm text-body-sm text-error">
            <Icon name="error" className="text-base" />
            {error}
          </p>
        )}

        <div className="mt-space-lg flex flex-wrap gap-space-sm">
          <Button variant="success" onClick={() => exportar('excel')} disabled={generando !== null} icon="download">
            {generando === 'excel' ? 'Generando…' : 'Exportar Excel'}
          </Button>
          <Button variant="secondary" onClick={() => exportar('pdf')} disabled={generando !== null} icon="picture_as_pdf">
            {generando === 'pdf' ? 'Generando…' : 'Exportar PDF'}
          </Button>
        </div>

        <p className="mt-space-md flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <Icon name="info" className="text-base" />
          El reporte incluye el encabezado institucional
          {institucion ? ` de "${institucion.nombre_ie}"` : ''} y las firmas configuradas ({firmas.length}).
        </p>
      </div>
    </div>
  )
}
