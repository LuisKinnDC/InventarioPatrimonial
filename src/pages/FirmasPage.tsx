import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button, Field, Input, Spinner } from '@/components/ui'
import {
  useCrearFirma,
  useEliminarFirma,
  useFirmas,
  useGuardarFirma,
  useSubirImagenFirma,
} from '@/data/firmas'
import { useGuardarInstitucion, useInstitucion } from '@/data/catalogos'
import { useAuth } from '@/auth/AuthContext'
import { supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import type { FirmaConfig, Institucion } from '@/types/database'

export function FirmasPage() {
  return (
    <div>
      <PageHeader
        icon="settings"
        title="Configuración"
        subtitle="Datos de la institución y firmas/sellos para los reportes"
      />
      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para configurar firmas e institución.
        </div>
      )}
      <div className="grid grid-cols-1 items-start gap-space-md lg:grid-cols-2">
        <InstitucionCard />
        <FirmasCard />
      </div>
    </div>
  )
}

/* --------------------------- Datos institución -------------------------- */
function InstitucionCard() {
  const { data: institucion, isLoading } = useInstitucion()

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-md flex items-center gap-space-xs">
        <Icon name="domain" className="text-primary text-lg" />
        <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
          Datos de la institución
        </h3>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        // key: al llegar los datos, el formulario se (re)inicializa una sola vez
        <InstitucionForm key={institucion?.id ?? 'nuevo'} inicial={institucion ?? {}} />
      )}
    </div>
  )
}

function InstitucionForm({ inicial }: { inicial: Partial<Institucion> }) {
  const guardar = useGuardarInstitucion()
  const [form, setForm] = useState<Partial<Institucion>>(inicial)
  const [ok, setOk] = useState(false)

  const set = (k: keyof Institucion, val: string) =>
    setForm((p) => ({ ...p, [k]: val }))

  const enviar = async () => {
    setOk(false)
    await guardar.mutateAsync(form)
    setOk(true)
  }

  const campos: [keyof Institucion, string][] = [
    ['nombre_ie', 'Nombre de la institución'],
    ['codigo_modular', 'Código'],
    ['responsable', 'Responsable (Director/a)'],
    ['cargo', 'Cargo'],
    ['departamento', 'Departamento'],
    ['provincia', 'Provincia'],
    ['distrito', 'Distrito'],
    ['pisos', 'Pisos'],
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {campos.map(([k, label]) => (
          <Field key={k} label={label}>
            <Input
              value={(form[k] as string) ?? ''}
              onChange={(e) => set(k, e.target.value)}
            />
          </Field>
        ))}
      </div>
      {ok && (
        <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-emerald-600">
          <Icon name="check_circle" className="text-base" />
          Guardado
        </p>
      )}
      <Button onClick={enviar} disabled={guardar.isPending} icon="save">
        {guardar.isPending ? 'Guardando…' : 'Guardar datos'}
      </Button>
    </div>
  )
}

/* ------------------------------- Firmas -------------------------------- */
function FirmasCard() {
  const { data: firmas = [], isLoading } = useFirmas()
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'ADMIN'
  const crear = useCrearFirma()
  const eliminar = useEliminarFirma()
  const [aEliminar, setAEliminar] = useState<FirmaConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  const agregar = async () => {
    setError(null)
    try {
      const orden = firmas.length
        ? Math.max(...firmas.map((f) => f.orden)) + 1
        : 1
      await crear.mutateAsync(orden)
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="draw" className="text-primary text-lg" />
          <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
            Firmas y sellos
          </h3>
        </div>
        {esAdmin && (
          <Button variant="secondary" icon="add" onClick={agregar} disabled={crear.isPending}>
            {crear.isPending ? 'Agregando…' : 'Agregar cargo'}
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-space-sm flex items-center gap-space-xs rounded-lg bg-rose-50 p-space-sm font-body-sm text-body-sm text-error">
          <Icon name="error" className="text-base" />
          {error}
        </p>
      )}

      {isLoading ? (
        <Spinner />
      ) : firmas.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No hay firmas configuradas.
          {esAdmin ? ' Usa “Agregar cargo” para crear la primera.' : ''}
        </p>
      ) : (
        <div className="space-y-space-md">
          {firmas.map((f) => (
            <FirmaItem
              key={f.id}
              firma={f}
              esAdmin={esAdmin}
              onEliminar={() => setAEliminar(f)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar firma"
        message={`¿Eliminar el cargo “${aEliminar?.cargo ?? ''}” y su firma?`}
        confirmLabel="Eliminar"
        danger
        icon="delete"
        loading={eliminar.isPending}
        onConfirm={async () => {
          if (!aEliminar) return
          await eliminar.mutateAsync(aEliminar.id)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

function FirmaItem({
  firma,
  esAdmin,
  onEliminar,
}: {
  firma: FirmaConfig
  esAdmin: boolean
  onEliminar: () => void
}) {
  const guardar = useGuardarFirma()
  const subir = useSubirImagenFirma()
  const [cargo, setCargo] = useState(firma.cargo)
  const [nombre, setNombre] = useState(firma.nombre_responsable)
  const [error, setError] = useState<string | null>(null)

  const onArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      await subir.mutateAsync({ id: firma.id, file })
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="rounded-lg border border-outline-variant/40 p-space-md">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-start">
        <div className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-variant bg-surface-container-low sm:w-28">
          {firma.firma_url ? (
            <img src={firma.firma_url} alt={firma.cargo} className="max-h-full" />
          ) : (
            <span className="font-body-sm text-body-sm text-outline">Sin imagen</span>
          )}
        </div>
        <div className="flex-1 space-y-space-xs">
          <Field label="Cargo">
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </Field>
          <Field label="Nombre del responsable">
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          {error && (
            <p className="flex items-center gap-space-2xs font-body-sm text-body-sm text-error">
              <Icon name="error" className="text-base" />
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-space-sm">
            <Button
              variant="secondary"
              icon="save"
              onClick={() => guardar.mutate({ id: firma.id, cargo, nombre_responsable: nombre })}
              disabled={guardar.isPending}
            >
              Guardar
            </Button>
            <label className="flex cursor-pointer items-center gap-space-xs rounded-lg bg-surface-container-low px-space-md py-space-sm font-label-md text-label-md text-primary hover:bg-surface-container">
              <Icon name="image" className="text-base" />
              {subir.isPending ? 'Subiendo…' : 'Subir PNG'}
              <input type="file" accept="image/png" hidden onChange={onArchivo} />
            </label>
            {esAdmin && (
              <Button variant="ghost" icon="delete" onClick={onEliminar} className="text-error">
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
