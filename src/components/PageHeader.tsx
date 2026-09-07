import type { ReactNode } from 'react'
import { Icon } from '@/components/Icon'

export function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  actions,
}: {
  title: string
  subtitle?: string
  icon?: string
  badge?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center gap-space-md">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name={icon} className="text-2xl" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-space-xs">
            <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">
              {title}
            </h2>
            {badge && (
              <span className="rounded bg-primary/10 px-space-xs py-space-2xs font-code-xs text-code-xs font-bold text-primary">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-xs">{actions}</div>}
    </div>
  )
}

export function EnConstruccion({ tareas }: { tareas: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-space-2xl text-center">
      <Icon name="construction" className="text-4xl text-outline-variant" />
      <p className="mt-space-xs font-label-md text-label-md text-on-surface-variant">
        Módulo en construcción
      </p>
      <ul className="mx-auto mt-space-md max-w-md space-y-space-2xs text-left font-body-sm text-body-sm text-on-surface-variant">
        {tareas.map((t) => (
          <li key={t} className="flex gap-space-xs">
            <Icon name="check_box_outline_blank" className="text-base text-outline" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}
