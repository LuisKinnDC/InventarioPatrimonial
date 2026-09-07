import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ScannerCamara } from '@/components/ScannerCamara'
import { useCategorias, useUbicaciones } from '@/data/catalogos'
import { ESTADO_CONSERVACION_LABEL, type BienInput, type EstadoConservacion } from '@/types/database'

export type ValoresBien = Partial<BienInput>

const vacio: ValoresBien = {
  codigo_patrimonial: '',
  codigo_interno: '',
  denominacion: '',
  cantidad: 1,
  ubicacion_id: null,
  categoria_id: null,
  marca: '',
  modelo: '',
  color: '',
  serie: '',
  estado_conservacion: 'B',
  procedencia: 'D',
  fecha_ingreso: '',
  valor_libro: 0,
  observaciones: '',
  estado_registro: 'ACTIVO',
}

/**
 * Formulario de bien. `modoRapido` = tras guardar, limpia y vuelve al primer
 * campo para digitación continua (Módulo 1). ENTER avanza al siguiente campo.
 */
export function BienForm({
  inicial,
  onSubmit,
  guardando,
  modoRapido = false,
  textoBoton = 'Guardar',
}: {
  inicial?: ValoresBien
  onSubmit: (v: ValoresBien) => Promise<void> | void
  guardando?: boolean
  modoRapido?: boolean
  textoBoton?: string
}) {
  const [v, setV] = useState<ValoresBien>({ ...vacio, ...inicial })
  const [camaraAbierta, setCamaraAbierta] = useState(false)
  const { data: ubicaciones = [] } = useUbicaciones()
  const { data: categorias = [] } = useCategorias()

  const set = <K extends keyof ValoresBien>(k: K, val: ValoresBien[K]) =>
    setV((prev) => ({ ...prev, [k]: val }))

  const onCodigoEscaneado = (codigo: string) => {
    setCamaraAbierta(false)
    set('codigo_patrimonial', codigo.trim())
  }

  // ENTER avanza al siguiente control (excepto en textarea)
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== 'Enter') return
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA') return
    e.preventDefault()
    const form = e.currentTarget
    const campos = Array.from(
      form.querySelectorAll<HTMLElement>('input, select, textarea, button'),
    ).filter((el) => !(el as HTMLInputElement).disabled)
    const idx = campos.indexOf(target)
    const next = campos[idx + 1]
    next?.focus()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(v)
    if (modoRapido) {
      setV({ ...vacio })
      const first = document.getElementById('campo-cod-pat')
      first?.focus()
    }
  }

  return (
    <form onSubmit={submit} onKeyDown={onKeyDown} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Cód. Patrimonial">
          <div className="flex gap-space-xs">
            <Input
              id="campo-cod-pat"
              value={v.codigo_patrimonial ?? ''}
              onChange={(e) => set('codigo_patrimonial', e.target.value)}
              maxLength={20}
              placeholder="Escanea o digita"
            />
            <button
              type="button"
              onClick={() => setCamaraAbierta(true)}
              title="Escanear código de barras con la cámara"
              className="flex shrink-0 items-center justify-center rounded-lg bg-primary px-space-sm text-on-primary hover:bg-secondary"
            >
              <Icon name="barcode_scanner" className="text-lg" />
            </button>
          </div>
        </Field>
        <Field label="Cód. Interno">
          <Input
            value={v.codigo_interno ?? ''}
            onChange={(e) => set('codigo_interno', e.target.value)}
          />
        </Field>
        <Field label="Cantidad">
          <Input
            type="number"
            min={0}
            value={v.cantidad ?? 1}
            onChange={(e) => set('cantidad', Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Nombre del bien *">
        <Input
          required
          value={v.denominacion ?? ''}
          onChange={(e) => set('denominacion', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Ubicación / Ambiente">
          <Select
            value={v.ubicacion_id ?? ''}
            onChange={(e) => set('ubicacion_id', e.target.value || null)}
          >
            <option value="">— Sin ubicación —</option>
            {ubicaciones.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre_ambiente}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoría">
          <Select
            value={v.categoria_id ?? ''}
            onChange={(e) =>
              set('categoria_id', e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">— Sin categoría —</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Marca">
          <Input value={v.marca ?? ''} onChange={(e) => set('marca', e.target.value)} />
        </Field>
        <Field label="Modelo">
          <Input value={v.modelo ?? ''} onChange={(e) => set('modelo', e.target.value)} />
        </Field>
        <Field label="Color">
          <Input value={v.color ?? ''} onChange={(e) => set('color', e.target.value)} />
        </Field>
        <Field label="Serie">
          <Input value={v.serie ?? ''} onChange={(e) => set('serie', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Estado">
          <Select
            value={v.estado_conservacion ?? ''}
            onChange={(e) =>
              set('estado_conservacion', (e.target.value || null) as EstadoConservacion | null)
            }
          >
            {(['B', 'R', 'M', 'Y'] as EstadoConservacion[]).map((e) => (
              <option key={e} value={e}>
                {e} · {ESTADO_CONSERVACION_LABEL[e]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Procedencia">
          <Input
            value={v.procedencia ?? ''}
            onChange={(e) => set('procedencia', e.target.value)}
            placeholder="D, C, APAFA…"
          />
        </Field>
        <Field label="Fecha ingreso">
          <Input
            type="date"
            value={v.fecha_ingreso ?? ''}
            onChange={(e) => set('fecha_ingreso', e.target.value || null)}
          />
        </Field>
        <Field label="Valor en libro (S/.)">
          <Input
            type="number"
            step="0.01"
            min={0}
            value={v.valor_libro ?? 0}
            onChange={(e) => set('valor_libro', Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Observaciones">
        <Textarea
          rows={2}
          value={v.observaciones ?? ''}
          onChange={(e) => set('observaciones', e.target.value)}
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : textoBoton}
        </Button>
      </div>

      {camaraAbierta && (
        <ScannerCamara
          open
          modo="barra"
          onClose={() => setCamaraAbierta(false)}
          onDetected={onCodigoEscaneado}
        />
      )}
    </form>
  )
}
