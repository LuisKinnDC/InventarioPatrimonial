import { useState, type FormEvent } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabaseConfigurado } from '@/lib/supabase'
import { Button, Field, Input } from '@/components/ui'
import { Icon } from '@/components/Icon'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setCargando(false)
  }

  return (
    <div className="flex h-full items-center justify-center bg-surface p-space-base">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
        {/* Cabecera institucional */}
        <div className="flex flex-col items-center gap-space-xs bg-primary px-space-lg py-space-xl text-on-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-on-primary/10">
            <Icon name="inventory_2" className="text-3xl text-tertiary-fixed-dim" />
          </div>
          <h1 className="font-headline-md text-headline-md font-bold">Inventario Patrimonial</h1>
          <p className="font-label-sm text-label-sm uppercase tracking-wider opacity-90">
            Gestión de bienes institucionales
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-space-md p-space-lg">
          {!supabaseConfigurado && (
            <div className="flex items-start gap-space-xs rounded-lg bg-amber-50 p-space-sm font-body-sm text-body-sm text-amber-800">
              <Icon name="warning" className="text-base" />
              <span>
                Falta configurar Supabase. Copia <code>.env.example</code> a <code>.env</code>.
              </span>
            </div>
          )}

          <Field label="Correo institucional">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Contraseña">
            <div className="relative">
              <Input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-space-2xs text-on-surface-variant hover:bg-surface-container-high"
              >
                <Icon name={verPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
              </button>
            </div>
          </Field>

          {error && (
            <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-error">
              <Icon name="error" className="text-base" />
              {error}
            </p>
          )}

          <Button type="submit" disabled={cargando} className="w-full" icon={cargando ? undefined : 'login'}>
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
