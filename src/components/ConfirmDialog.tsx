import { Button, Modal } from '@/components/ui'
import { Icon } from '@/components/Icon'

/**
 * Diálogo de confirmación reutilizable (cerrar sesión, eliminar, etc.).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  icon,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  icon?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex items-start gap-space-md">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-rose-100 text-error' : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon name={icon ?? (danger ? 'warning' : 'help')} className="text-xl" />
        </div>
        <p className="pt-space-2xs font-body-md text-body-md text-on-surface-variant">
          {message}
        </p>
      </div>

      <div className="mt-space-lg flex justify-end gap-space-sm">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Procesando…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
