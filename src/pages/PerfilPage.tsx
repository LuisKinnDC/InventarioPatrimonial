import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Icon } from '@/components/Icon'
import { Badge, Button, Field, Input } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { mensajeError } from '@/lib/errores'
import type { RolUsuario } from '@/types/database'

const ROL_COLOR: Record<RolUsuario, 'green' | 'sky' | 'neutral'> = {
  ADMIN: 'green',
  OPERADOR: 'sky',
  LECTOR: 'neutral',
}

export function PerfilPage() {
  const { session, perfil } = useAuth()

  return (
    <div>
      <PageHeader
        icon="account_circle"
        title="Mi perfil"
        subtitle="Datos de tu cuenta y seguridad"
      />

      {!supabaseConfigurado && (
        <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-50 p-space-md font-body-sm text-body-sm text-amber-800">
          <Icon name="warning" className="text-lg" />
          Conecta Supabase para gestionar tu perfil.
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-space-md lg:grid-cols-2">
        {/* Datos de la cuenta */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="mb-space-md flex items-center gap-space-xs">
            <Icon name="badge" className="text-primary text-lg" />
            <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
              Datos de la cuenta
            </h3>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container font-headline-md text-headline-md font-bold text-on-primary">
              {(perfil?.nombre ?? session?.user.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-headline-sm text-headline-sm font-semibold text-on-surface">
                {perfil?.nombre ?? '—'}
              </p>
              <Badge color={ROL_COLOR[perfil?.rol ?? 'LECTOR']}>
                {perfil?.rol ?? 'LECTOR'}
              </Badge>
            </div>
          </div>

          <div className="mt-space-md space-y-space-2xs border-t border-outline-variant/40 pt-space-md">
            <Dato icon="mail" label="Correo" valor={session?.user.email ?? '—'} />
            <Dato
              icon="shield_person"
              label="Rol"
              valor={perfil?.rol ?? 'LECTOR'}
            />
          </div>
        </div>

        {/* Cambiar contraseña */}
        <CambiarPasswordCard />
      </div>
    </div>
  )
}

function Dato({ icon, label, valor }: { icon: string; label: string; valor: string }) {
  return (
    <div className="flex items-center gap-space-sm py-space-2xs">
      <Icon name={icon} className="text-on-surface-variant text-base" />
      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
        {label}:
      </span>
      <span className="truncate font-body-md text-body-md text-on-surface">{valor}</span>
    </div>
  )
}

/* --------------------------- Cambiar contraseña ------------------------- */
function CambiarPasswordCard() {
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [ver, setVer] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiar = async () => {
    setError(null)
    setOk(false)
    if (nueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setCargando(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: nueva })
      if (error) throw error
      setOk(true)
      setNueva('')
      setConfirmar('')
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-md flex items-center gap-space-xs">
        <Icon name="lock_reset" className="text-primary text-lg" />
        <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">
          Cambiar contraseña
        </h3>
      </div>

      <div className="space-y-space-sm">
        <Field label="Nueva contraseña">
          <div className="relative">
            <Input
              type={ver ? 'text' : 'password'}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="pr-10"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              aria-label={ver ? 'Ocultar' : 'Ver'}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-space-2xs text-on-surface-variant hover:bg-surface-container-high"
            >
              <Icon name={ver ? 'visibility_off' : 'visibility'} className="text-lg" />
            </button>
          </div>
        </Field>
        <Field label="Confirmar contraseña">
          <Input
            type={ver ? 'text' : 'password'}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
        </Field>

        {ok && (
          <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-emerald-600">
            <Icon name="check_circle" className="text-base" />
            Contraseña actualizada correctamente.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-error">
            <Icon name="error" className="text-base" />
            {error}
          </p>
        )}

        <Button onClick={cambiar} disabled={cargando} icon="lock_reset">
          {cargando ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </div>
    </div>
  )
}
