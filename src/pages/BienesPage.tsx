import { useState, type KeyboardEvent } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Badge, Button, EmptyState, Modal, Select, Spinner } from '@/components/ui'
import { BienForm, type ValoresBien } from '@/components/BienForm'
import { ScannerCamara } from '@/components/ScannerCamara'
import {
  useActualizarBien,
  useBienes,
  useBuscarPorCodigo,
  useEliminarBien,
  type BienConRelaciones,
  type FiltrosBienes,
} from '@/data/bienes'
import { useCategorias, useUbicaciones } from '@/data/catalogos'
import { supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import { ESTADO_CONSERVACION_LABEL, type EstadoConservacion } from '@/types/database'

const estadoColor: Record<EstadoConservacion, 'green' | 'amber' | 'red' | 'neutral'> = {
  B: 'green',
  R: 'amber',
  M: 'red',
  Y: 'neutral',
}
const estadoDot: Record<EstadoConservacion, string> = {
  B: 'bg-emerald-500',
  R: 'bg-amber-500',
  M: 'bg-rose-500',
  Y: 'bg-slate-500',
}

const soles = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n ?? 0)

export function BienesPage() {
  const [filtros, setFiltros] = useState<FiltrosBienes>({
    page: 0,
    pageSize: 25,
    soloActivos: true,
  })
  const [editando, setEditando] = useState<BienConRelaciones | null>(null)
  const [scanMsg, setScanMsg] = useState<{ ok: boolean; texto: string } | null>(null)
  const [camaraAbierta, setCamaraAbierta] = useState(false)

  const { data, isLoading, isError, error } = useBienes(filtros)
  const { data: ubicaciones = [] } = useUbicaciones()
  const { data: categorias = [] } = useCategorias()
  const actualizar = useActualizarBien()
  const eliminar = useEliminarBien()
  const buscarCodigo = useBuscarPorCodigo()

  const setF = (parcial: Partial<FiltrosBienes>) =>
    setFiltros((p) => ({ ...p, page: 0, ...parcial }))

  const total = data?.total ?? 0
  const pageSize = filtros.pageSize ?? 25
  const page = filtros.page ?? 0
  const paginas = Math.max(1, Math.ceil(total / pageSize))

  const procesarCodigo = async (codigo: string) => {
    const c = codigo.trim()
    if (!c) return
    const bien = await buscarCodigo.mutateAsync(c)
    if (bien) {
      setScanMsg({ ok: true, texto: `Bien localizado: ${bien.denominacion}` })
      setEditando(bien)
    } else {
      setScanMsg({ ok: false, texto: `Sin coincidencias para "${c}". Se aplicó como filtro.` })
      setF({ texto: c })
    }
  }

  const onEscanear = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const el = e.target as HTMLInputElement
    if (!el.value.trim()) return
    await procesarCodigo(el.value)
    el.value = ''
  }

  const onCamaraDetecta = (codigo: string) => {
    setCamaraAbierta(false)
    void procesarCodigo(codigo)
  }

  const guardarEdicion = async (v: ValoresBien) => {
    if (!editando) return
    await actualizar.mutateAsync({ id: editando.id, cambios: v })
    setEditando(null)
  }

  const borrar = async (b: BienConRelaciones) => {
    if (!confirm(`¿Eliminar definitivamente "${b.denominacion}"?`)) return
    await eliminar.mutateAsync(b.id)
  }

  return (
    <div className="space-y-space-md">
      <PageHeader
        icon="inventory_2"
        title="Inventario"
        subtitle={`${total} bien(es) ${filtros.soloActivos ? 'activos' : 'en total'}`}
      />

      {!supabaseConfigurado && <AvisoSupabase />}

      {/* Escáner de código de barras / QR (cámara o lector físico) */}
      <div className="rounded-xl bg-inverse-surface p-space-md text-inverse-on-surface shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Icon name="qr_code_scanner" className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-emerald-400">
                Escanear bien
              </span>
              <span className="font-body-sm text-body-sm text-outline-variant">
                Usa la cámara o un lector físico (escribe el código y ENTER)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="relative w-64">
              <Icon
                name="barcode_reader"
                className="absolute left-2.5 top-2 text-base text-surface-container-high"
              />
              <input
                className="w-full rounded-lg bg-surface-container-lowest py-space-sm pl-9 pr-space-md font-mono text-code-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary"
                onKeyDown={onEscanear}
                placeholder="Código + ENTER…"
              />
            </div>
            <button
              onClick={() => setCamaraAbierta(true)}
              className="flex items-center gap-space-xs rounded-lg bg-emerald-600 px-space-md py-space-sm font-label-md text-label-md text-white hover:bg-emerald-500"
            >
              <Icon name="photo_camera" className="text-base" />
              Cámara
            </button>
          </div>
        </div>
        {scanMsg && (
          <div
            className={`mt-space-sm flex items-center gap-space-sm rounded-lg px-space-sm py-space-xs font-code-sm text-code-sm ${
              scanMsg.ok ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/70 text-rose-300'
            }`}
          >
            <Icon name={scanMsg.ok ? 'check_circle' : 'error'} className="text-lg" />
            {scanMsg.texto}
          </div>
        )}
      </div>

      {/* Barra de control: filtros */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="grid grid-cols-1 gap-space-sm md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Icon
              name="search"
              className="absolute left-2.5 top-2.5 text-base text-outline-variant"
            />
            <input
              className="w-full rounded-lg bg-surface-container-low py-space-sm pl-9 pr-space-md font-body-sm text-body-sm text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              placeholder="Buscar por nombre, marca, serie o código…"
              onChange={(e) => setF({ texto: e.target.value })}
            />
          </div>
          <Select className="md:col-span-3" onChange={(e) => setF({ ubicacionId: e.target.value || null })}>
            <option value="">Ubicación: Todas</option>
            {ubicaciones.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre_ambiente}
              </option>
            ))}
          </Select>
          <Select
            className="md:col-span-2"
            onChange={(e) => setF({ categoriaId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Categoría: Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Select
            className="md:col-span-2"
            onChange={(e) => setF({ estado: (e.target.value || null) as EstadoConservacion | null })}
          >
            <option value="">Estado: Todos</option>
            {(['B', 'R', 'M', 'Y'] as EstadoConservacion[]).map((e) => (
              <option key={e} value={e}>
                {ESTADO_CONSERVACION_LABEL[e]}
              </option>
            ))}
          </Select>
        </div>
        <label className="mt-space-sm flex w-fit items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={!filtros.soloActivos}
            onChange={(e) => setF({ soloActivos: !e.target.checked })}
          />
          Incluir bienes dados de baja
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs">
          <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
            Bienes registrados
          </span>
          <span className="rounded bg-surface-container-highest px-space-xs py-space-2xs font-code-xs text-code-xs text-primary">
            {data?.filas.length ?? 0} visibles de {total}
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <p className="p-space-lg font-body-sm text-body-sm text-error">Error: {mensajeError(error)}</p>
          ) : !data || data.filas.length === 0 ? (
            <EmptyState title="Sin resultados" hint="Ajusta los filtros o registra bienes." icon="search_off" />
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-space-sm py-space-xs">Cód. Int.</th>
                  <th className="px-space-md py-space-xs">Denominación</th>
                  <th className="px-space-sm py-space-xs">Ubicación</th>
                  <th className="px-space-sm py-space-xs">Marca / Serie</th>
                  <th className="px-space-xs py-space-xs text-center">Cant</th>
                  <th className="px-space-xs py-space-xs text-center">Estado</th>
                  <th className="px-space-sm py-space-xs text-right">Valor Libro</th>
                  <th className="px-space-sm py-space-xs"></th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {data.filas.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-outline-variant/30 hover:bg-surface-container-low"
                  >
                    <td className="px-space-sm py-space-xs font-mono text-code-xs text-on-surface-variant">
                      {b.codigo_interno ?? '—'}
                    </td>
                    <td className="px-space-md py-space-xs">
                      <div className="font-label-md text-label-md text-on-surface">{b.denominacion}</div>
                      {b.es_baja && <Badge color="red">BAJA</Badge>}
                    </td>
                    <td className="px-space-sm py-space-xs text-on-surface-variant">
                      {b.ubicacion?.nombre_ambiente ?? '—'}
                    </td>
                    <td className="px-space-sm py-space-xs text-on-surface-variant">
                      {b.marca ?? '—'}
                      {b.serie && (
                        <span className="block font-mono text-code-xs text-outline">{b.serie}</span>
                      )}
                    </td>
                    <td className="px-space-xs py-space-xs text-center">{b.cantidad}</td>
                    <td className="px-space-xs py-space-xs text-center">
                      {b.estado_conservacion ? (
                        <span className="inline-flex items-center gap-space-2xs">
                          <span className={`h-2 w-2 rounded-full ${estadoDot[b.estado_conservacion]}`} />
                          <Badge color={estadoColor[b.estado_conservacion]}>{b.estado_conservacion}</Badge>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-space-sm py-space-xs text-right font-mono text-code-sm text-on-surface">
                      {soles(b.valor_libro)}
                    </td>
                    <td className="whitespace-nowrap px-space-sm py-space-xs text-right">
                      <Button variant="ghost" onClick={() => setEditando(b)} className="px-space-xs py-space-2xs">
                        <Icon name="edit" className="text-base" />
                      </Button>
                      <Button variant="ghost" onClick={() => borrar(b)} className="px-space-xs py-space-2xs">
                        <Icon name="delete" className="text-base text-error" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación */}
      {total > pageSize && (
        <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>
            Página {page + 1} de {paginas}
          </span>
          <div className="flex gap-space-xs">
            <Button
              variant="secondary"
              icon="chevron_left"
              disabled={page === 0}
              onClick={() => setFiltros((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              disabled={page + 1 >= paginas}
              onClick={() => setFiltros((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
            >
              Siguiente
              <Icon name="chevron_right" className="text-base" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!editando}
        onClose={() => setEditando(null)}
        title={`Editar: ${editando?.denominacion ?? ''}`}
        wide
      >
        {editando && (
          <BienForm
            inicial={editando}
            onSubmit={guardarEdicion}
            guardando={actualizar.isPending}
            textoBoton="Guardar cambios"
          />
        )}
      </Modal>

      {camaraAbierta && (
        <ScannerCamara
          open
          onClose={() => setCamaraAbierta(false)}
          onDetected={onCamaraDetecta}
        />
      )}
    </div>
  )
}

function AvisoSupabase() {
  return (
    <div className="flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
      <Icon name="warning" className="text-lg" />
      Conecta Supabase para ver los bienes.
    </div>
  )
}
