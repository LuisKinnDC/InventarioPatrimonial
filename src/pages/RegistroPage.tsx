import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { BienForm, type ValoresBien } from '@/components/BienForm'
import { Icon } from '@/components/Icon'
import { useCrearBien } from '@/data/bienes'
import { supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'

export function RegistroPage() {
  const crear = useCrearBien()
  const [ultimos, setUltimos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const guardar = async (v: ValoresBien) => {
    setError(null)
    try {
      await crear.mutateAsync(v)
      setUltimos((prev) => [v.denominacion ?? '(sin nombre)', ...prev].slice(0, 8))
    } catch (e) {
      setError(mensajeError(e))
      throw e
    }
  }

  return (
    <div>
      <PageHeader
        icon="add_box"
        title="Registro Ágil de Bienes"
        subtitle="ENTER avanza al siguiente campo; al guardar, el formulario se limpia para el siguiente bien"
      />

      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para poder guardar.
        </div>
      )}

      <div className="grid grid-cols-1 gap-space-md lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          {error && (
            <p className="mb-space-md flex items-center gap-space-xs rounded-lg bg-rose-50 p-space-sm font-body-sm text-body-sm text-error">
              <Icon name="error" className="text-base" />
              {error}
            </p>
          )}
          <BienForm onSubmit={guardar} guardando={crear.isPending} modoRapido textoBoton="Guardar y continuar" />
        </div>

        <aside className="h-fit rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          <div className="mb-space-sm flex items-center gap-space-xs">
            <Icon name="history" className="text-primary text-lg" />
            <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
              Últimos registrados
            </h3>
          </div>
          {ultimos.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Aún no hay registros en esta sesión.
            </p>
          ) : (
            <ul className="space-y-space-xs">
              {ultimos.map((n, i) => (
                <li
                  key={i}
                  className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-sm py-space-xs font-body-sm text-body-sm text-on-surface"
                >
                  <Icon name="check_circle" className="text-base text-emerald-600" />
                  <span className="truncate">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
