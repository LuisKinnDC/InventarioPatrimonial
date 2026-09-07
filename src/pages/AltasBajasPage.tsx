import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Badge, Button, Field, Input, Select, Spinner } from '@/components/ui'
import { useBienes, type BienConRelaciones } from '@/data/bienes'
import { useMovimientos, useRegistrarMovimiento } from '@/data/movimientos'
import { supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import type { TipoMovimiento } from '@/types/database'

const MOTIVOS_BAJA = ['Obsolescencia', 'Deterioro / Malogrado', 'Hurto / Robo', 'Extravío', 'Chatarra', 'Otro']
const MOTIVOS_ALTA = ['Compra APAFA', 'Donación MINEDU', 'Donación UGEL / DRE', 'Transferencia', 'Recuperado', 'Otro']

export function AltasBajasPage() {
  const [busqueda, setBusqueda] = useState('')
  const [sel, setSel] = useState<BienConRelaciones | null>(null)
  const [tipo, setTipo] = useState<TipoMovimiento>('BAJA')
  const [motivo, setMotivo] = useState('')
  const [resolucion, setResolucion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: resultados } = useBienes({ texto: busqueda, soloActivos: false, pageSize: 8 })
  const { data: movimientos = [], isLoading } = useMovimientos()
  const registrar = useRegistrarMovimiento()

  const motivos = tipo === 'BAJA' ? MOTIVOS_BAJA : MOTIVOS_ALTA

  const enviar = async () => {
    if (!sel) return
    setError(null)
    setOk(null)
    try {
      await registrar.mutateAsync({
        bien_id: sel.id,
        tipo,
        motivo: motivo || undefined,
        nro_resolucion: resolucion || undefined,
        fecha,
      })
      setOk(`${tipo} registrada para "${sel.denominacion}"`)
      setSel(null)
      setBusqueda('')
      setMotivo('')
      setResolucion('')
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        icon="swap_horiz"
        title="Altas y Bajas"
        subtitle="Incorporación y retiro de bienes con trazabilidad para auditoría"
      />

      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para registrar movimientos.
        </div>
      )}

      <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
        {/* Formulario */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="mb-space-md font-headline-sm text-headline-sm font-semibold text-primary">
            Registrar movimiento
          </h3>

          {ok && (
            <p className="mb-space-sm flex items-center gap-space-xs rounded-lg bg-emerald-50 p-space-sm font-body-sm text-body-sm text-emerald-700">
              <Icon name="check_circle" className="text-base" />
              {ok}
            </p>
          )}
          {error && (
            <p className="mb-space-sm flex items-center gap-space-xs rounded-lg bg-rose-50 p-space-sm font-body-sm text-body-sm text-error">
              <Icon name="error" className="text-base" />
              {error}
            </p>
          )}

          {!sel ? (
            <div>
              <Field label="Buscar bien (nombre o código)">
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej. COMPUTADORA, 553214…"
                  autoFocus
                />
              </Field>
              {busqueda && (
                <ul className="mt-space-sm max-h-64 divide-y divide-outline-variant/30 overflow-auto rounded-lg border border-outline-variant/40">
                  {(resultados?.filas ?? []).map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => setSel(b)}
                        className="flex w-full items-center justify-between px-space-sm py-space-xs text-left font-body-sm text-body-sm hover:bg-surface-container-low"
                      >
                        <span>
                          <span className="font-label-md text-label-md text-on-surface">{b.denominacion}</span>
                          <span className="ml-space-xs font-mono text-code-xs text-outline">
                            {b.codigo_interno ?? b.codigo_patrimonial ?? ''}
                          </span>
                        </span>
                        {b.es_baja && <Badge color="red">BAJA</Badge>}
                      </button>
                    </li>
                  ))}
                  {resultados && resultados.filas.length === 0 && (
                    <li className="px-space-sm py-space-xs font-body-sm text-body-sm text-outline">Sin coincidencias</li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            <div className="mb-space-md flex items-center justify-between rounded-lg bg-surface-container-low p-space-sm">
              <div>
                <p className="font-label-md text-label-md text-on-surface">{sel.denominacion}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {sel.codigo_interno ?? ''} · {sel.ubicacion?.nombre_ambiente ?? 'sin ubicación'} ·{' '}
                  {sel.es_baja ? 'DADO DE BAJA' : 'ACTIVO'}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSel(null)}>
                Cambiar
              </Button>
            </div>
          )}

          {sel && (
            <div className="space-y-space-md">
              <div className="grid grid-cols-2 gap-space-md">
                <Field label="Tipo de movimiento">
                  <Select
                    value={tipo}
                    onChange={(e) => {
                      setTipo(e.target.value as TipoMovimiento)
                      setMotivo('')
                    }}
                  >
                    <option value="BAJA">BAJA (retiro del padrón)</option>
                    <option value="ALTA">ALTA (incorporación / reactivación)</option>
                  </Select>
                </Field>
                <Field label="Fecha">
                  <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </Field>
              </div>

              <Field label="Motivo">
                <Select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {motivos.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Nº de Resolución / Acta">
                <Input
                  value={resolucion}
                  onChange={(e) => setResolucion(e.target.value)}
                  placeholder="Ej. R.D. Nº 001-2025"
                />
              </Field>

              <Button
                onClick={enviar}
                disabled={registrar.isPending}
                variant={tipo === 'BAJA' ? 'danger' : 'success'}
                icon={tipo === 'BAJA' ? 'delete_sweep' : 'add_task'}
              >
                {registrar.isPending ? 'Registrando…' : `Registrar ${tipo}`}
              </Button>
            </div>
          )}
        </div>

        {/* Historial */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="mb-space-md font-headline-sm text-headline-sm font-semibold text-primary">
            Movimientos recientes
          </h3>
          {isLoading ? (
            <Spinner />
          ) : movimientos.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Sin movimientos registrados.</p>
          ) : (
            <ul className="space-y-space-sm">
              {movimientos.map((m) => (
                <li key={m.id} className="flex items-start gap-space-sm">
                  <Badge color={m.tipo === 'BAJA' ? 'red' : 'green'}>{m.tipo}</Badge>
                  <div className="flex-1">
                    <p className="font-label-md text-label-md text-on-surface">
                      {m.bien?.denominacion ?? '(bien eliminado)'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {m.fecha} · {m.motivo ?? 'sin motivo'}
                      {m.nro_resolucion ? ` · ${m.nro_resolucion}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
