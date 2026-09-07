import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { Icon } from '@/components/Icon'

/* ------------------------------- Button -------------------------------- */
type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-secondary shadow-sm',
  secondary:
    'bg-surface-container-low text-primary hover:bg-surface-container shadow-sm',
  danger: 'bg-error text-on-error hover:opacity-90 shadow-sm',
  success: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm',
  ghost: 'text-on-surface-variant hover:bg-surface-container-high',
}

export function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: string }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-space-xs rounded-lg px-space-md py-space-sm font-label-md text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="text-base" />}
      {children}
    </button>
  )
}

/* ------------------------------- Field --------------------------------- */
export function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-space-2xs block font-label-sm text-label-sm uppercase text-on-surface-variant">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg bg-surface-container-low px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary disabled:opacity-60'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return <input ref={ref} className={`${inputBase} ${className}`} {...props} />
  },
)

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = '', ...props }, ref) {
  return <select ref={ref} className={`${inputBase} ${className}`} {...props} />
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`${inputBase} ${className}`} {...props} />
})

/* ------------------------------- Badge --------------------------------- */
type BadgeColor = 'neutral' | 'primary' | 'green' | 'amber' | 'red' | 'sky' | 'slate' | 'blue'

const BADGE: Record<BadgeColor, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant',
  slate: 'bg-surface-container-high text-on-surface-variant',
  primary: 'bg-primary/10 text-primary',
  blue: 'bg-primary/10 text-primary',
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-rose-100 text-rose-800',
  sky: 'bg-sky-100 text-sky-800',
}

export function Badge({
  children,
  color = 'neutral',
}: {
  children: ReactNode
  color?: BadgeColor
}) {
  return (
    <span
      className={`inline-flex items-center gap-space-2xs rounded px-space-xs py-space-2xs font-code-xs text-code-xs font-semibold ${BADGE[color]}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------- Modal --------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-on-background/40 p-space-base backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`mt-10 w-full rounded-xl bg-surface-container-lowest shadow-xl ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl bg-surface-container-low px-space-lg py-space-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-space-2xs text-on-surface-variant hover:bg-surface-container-high"
            aria-label="Cerrar"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>
        <div className="p-space-lg">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------ Spinner -------------------------------- */
export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-space-sm py-space-2xl font-body-sm text-body-sm text-on-surface-variant">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-container-highest border-t-primary" />
      {label}
    </div>
  )
}

/* ----------------------------- EmptyState ------------------------------ */
export function EmptyState({ title, hint, icon = 'inbox' }: { title: string; hint?: string; icon?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-space-2xl text-center">
      <Icon name={icon} className="text-4xl text-outline-variant" />
      <p className="mt-space-xs font-headline-sm text-headline-sm text-on-surface">{title}</p>
      {hint && <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  )
}

/* -------------------------------- Card --------------------------------- */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl bg-surface-container-lowest shadow-sm ${className}`}>
      {children}
    </div>
  )
}
