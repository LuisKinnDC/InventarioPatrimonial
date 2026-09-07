import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Button, Spinner } from '@/components/ui'
import { parsearAnexo05, type FilaImportada } from '@/lib/importExcel'
import { insertarBienesLote } from '@/data/bienes'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import type { BienInput } from '@/types/database'

type Fase = 'inicial' | 'previsualizando' | 'importando' | 'listo'

export function ImportarPage() {
  const qc = useQueryClient()
  const [fase, setFase] = useState<Fase>('inicial')
  const [filas, setFilas] = useState<FilaImportada[]>([])
  const [descartadas, setDescartadas] = useState(0)
  const [nuevasUbicaciones, setNuevasUbicaciones] = useState<string[]>([])
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 })
  const [insertados, setInsertados] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const res = await parsearAnexo05(file)
      setFilas(res.filas)
      setDescartadas(res.descartadas)

      const { data: ubis } = await supabase.from('ubicaciones').select('nombre_ambiente')
      const existentes = new Set((ubis ?? []).map((u) => u.nombre_ambiente.trim().toUpperCase()))
      const nuevas = new Set<string>()
      for (const f of res.filas) {
        const nom = f.ubicacionNombre?.trim()
        if (nom && !existentes.has(nom.toUpperCase())) nuevas.add(nom)
      }
      setNuevasUbicaciones([...nuevas])
      setFase('previsualizando')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const importar = async () => {
    setFase('importando')
    setError(null)
    try {
      if (nuevasUbicaciones.length) {
        const { error: insErr } = await supabase
          .from('ubicaciones')
          .insert(nuevasUbicaciones.map((n) => ({ nombre_ambiente: n })))
        if (insErr) throw insErr
      }
      const { data: ubis, error: ubiErr } = await supabase
        .from('ubicaciones')
        .select('id, nombre_ambiente')
      if (ubiErr) throw ubiErr
      const mapa = new Map((ubis ?? []).map((u) => [u.nombre_ambiente.trim().toUpperCase(), u.id]))

      const bienes: Partial<BienInput>[] = filas.map((f) => ({
        codigo_patrimonial: f.codigo_patrimonial,
        codigo_interno: f.codigo_interno,
        denominacion: f.denominacion,
        cantidad: f.cantidad,
        ubicacion_id: f.ubicacionNombre ? (mapa.get(f.ubicacionNombre.trim().toUpperCase()) ?? null) : null,
        marca: f.marca,
        modelo: f.modelo,
        color: f.color,
        serie: f.serie,
        estado_conservacion: f.estado_conservacion,
        procedencia: f.procedencia,
        fecha_ingreso: f.fecha_ingreso,
        valor_libro: f.valor_libro,
        observaciones: f.observaciones,
        estado_registro: 'ACTIVO',
      }))

      setProgreso({ hechos: 0, total: bienes.length })
      const { insertados: n } = await insertarBienesLote(bienes, (hechos, total) =>
        setProgreso({ hechos, total }),
      )
      setInsertados(n)
      qc.invalidateQueries({ queryKey: ['bienes'] })
      qc.invalidateQueries({ queryKey: ['ubicaciones'] })
      qc.invalidateQueries({ queryKey: ['valorizacion'] })
      setFase('listo')
    } catch (err) {
      setError(mensajeError(err))
      setFase('previsualizando')
    }
  }

  const reiniciar = () => {
    setFase('inicial')
    setFilas([])
    setDescartadas(0)
    setNuevasUbicaciones([])
    setInsertados(0)
    setError(null)
  }

  return (
    <div>
      <PageHeader
        icon="upload_file"
        title="Importar Excel"
        subtitle="Carga masiva de bienes desde un archivo Excel existente"
      />

      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para poder importar.
        </div>
      )}

      {error && (
        <p className="mb-space-md flex items-center gap-space-xs rounded-lg bg-rose-50 p-space-md font-body-sm text-body-sm text-error">
          <Icon name="error" className="text-base" />
          {error}
        </p>
      )}

      {fase === 'inicial' && (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-space-2xl text-center">
          <Icon name="cloud_upload" className="text-5xl text-primary" />
          <p className="mx-auto mt-space-sm mb-space-md max-w-lg font-body-sm text-body-sm text-on-surface-variant">
            Selecciona el archivo <b>.xlsx</b>. Las columnas se mapean automáticamente
            (Código, Nombre del bien, Cantidad, Ubicación, Marca, Modelo, Color, Serie,
            Estado, Procedencia, Fecha y Valor).
          </p>
          <label className="inline-flex cursor-pointer items-center gap-space-xs rounded-lg bg-primary px-space-md py-space-sm font-label-md text-label-md text-on-primary shadow-sm hover:bg-secondary">
            <Icon name="upload_file" className="text-base" />
            Elegir archivo Excel
            <input type="file" accept=".xlsx,.xls" hidden onChange={onArchivo} />
          </label>
        </div>
      )}

      {fase === 'previsualizando' && (
        <div className="space-y-space-md">
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
            <Info icon="playlist_add_check" label="Filas a importar" valor={filas.length} color="emerald" />
            <Info icon="filter_alt_off" label="Filas descartadas" valor={descartadas} color="amber" />
            <Info icon="add_location_alt" label="Ubicaciones nuevas" valor={nuevasUbicaciones.length} color="sky" />
          </div>

          {nuevasUbicaciones.length > 0 && (
            <div className="flex items-start gap-space-xs rounded-lg bg-sky-50 p-space-sm font-body-sm text-body-sm text-sky-800">
              <Icon name="info" className="text-base" />
              <span>
                Se crearán estos ambientes nuevos:{' '}
                <span className="font-medium">{nuevasUbicaciones.join(', ')}</span>
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="bg-surface-container-high font-label-sm text-label-sm uppercase text-on-surface-variant">
                  <tr>
                    <th className="px-space-sm py-space-xs">Cód.Int</th>
                    <th className="px-space-sm py-space-xs">Denominación</th>
                    <th className="px-space-sm py-space-xs">Ubicación</th>
                    <th className="px-space-sm py-space-xs">Marca</th>
                    <th className="px-space-sm py-space-xs">Est</th>
                    <th className="px-space-sm py-space-xs text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.slice(0, 15).map((f, i) => (
                    <tr key={i} className="border-b border-outline-variant/30">
                      <td className="px-space-sm py-space-xs font-mono text-code-xs">{f.codigo_interno ?? '—'}</td>
                      <td className="px-space-sm py-space-xs">{f.denominacion}</td>
                      <td className="px-space-sm py-space-xs text-on-surface-variant">{f.ubicacionNombre ?? '—'}</td>
                      <td className="px-space-sm py-space-xs text-on-surface-variant">{f.marca ?? '—'}</td>
                      <td className="px-space-sm py-space-xs">{f.estado_conservacion ?? '—'}</td>
                      <td className="px-space-sm py-space-xs text-right font-mono">{f.valor_libro.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filas.length > 15 && (
              <p className="p-space-xs text-center font-body-sm text-body-sm text-outline">
                … y {filas.length - 15} filas más
              </p>
            )}
          </div>

          <div className="flex gap-space-sm">
            <Button onClick={importar} disabled={filas.length === 0} icon="upload">
              Confirmar e importar {filas.length} bienes
            </Button>
            <Button variant="secondary" onClick={reiniciar}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {fase === 'importando' && (
        <div className="rounded-xl bg-surface-container-lowest p-space-2xl shadow-sm">
          <Spinner label={`Importando ${progreso.hechos} / ${progreso.total}…`} />
          <div className="mx-auto mt-space-xs h-2 max-w-md overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progreso.total ? (progreso.hechos / progreso.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {fase === 'listo' && (
        <div className="rounded-xl bg-emerald-50 p-space-2xl text-center">
          <Icon name="task_alt" className="text-5xl text-emerald-600" />
          <p className="mt-space-sm font-headline-md text-headline-md font-semibold text-emerald-800">
            {insertados} bienes importados correctamente
          </p>
          <Button variant="secondary" className="mt-space-md" onClick={reiniciar} icon="restart_alt">
            Importar otro archivo
          </Button>
        </div>
      )}
    </div>
  )
}

const INFO_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-900',
  amber: 'bg-amber-50 text-amber-900',
  sky: 'bg-sky-50 text-sky-900',
}

function Info({
  icon,
  label,
  valor,
  color,
}: {
  icon: string
  label: string
  valor: number
  color: keyof typeof INFO_COLORS
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl p-space-md shadow-sm ${INFO_COLORS[color]}`}>
      <div>
        <p className="font-label-sm text-label-sm uppercase tracking-wide opacity-70">{label}</p>
        <p className="mt-space-2xs font-headline-lg text-headline-lg font-bold">{valor}</p>
      </div>
      <Icon name={icon} className="text-3xl opacity-50" />
    </div>
  )
}
