/**
 * Icono Material Symbols Outlined.
 * Uso: <Icon name="inventory_2" className="text-lg text-primary" />
 * Lista de nombres: https://fonts.google.com/icons
 */
export function Icon({
  name,
  className = '',
  filled = false,
}: {
  name: string
  className?: string
  filled?: boolean
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
