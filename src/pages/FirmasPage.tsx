import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Button, Field, Input, Spinner } from '@/components/ui'
import { useFirmas, useGuardarFirma, useSubirImagenFirma } from '@/data/firmas'
import { useGuardarInstitucion, useInstitucion } from '@/data/catalogos'
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
      <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
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

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-md flex items-center gap-space-xs">
        <Icon name="draw" className="text-primary text-lg" />
        <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
          Firmas y sellos (PNG transparente)
        </h3>
      </div>
      {isLoading ? (
        <Spinner />
      ) : firmas.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No hay firmas configuradas. Se crean con el seed inicial.
        </p>
      ) : (
        <div className="space-y-space-md">
          {firmas.map((f) => (
            <FirmaItem key={f.id} firma={f} />
          ))}
        </div>
      )}
    </div>
  )
}

function FirmaItem({ firma }: { firma: FirmaConfig }) {
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
      <div className="flex items-start gap-space-md">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-variant bg-surface-container-low">
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
          <div className="flex items-center gap-space-sm">
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
          </div>
        </div>
      </div>
    </div>
  )
}
