/**
 * Extrae un mensaje legible de cualquier error.
 * Supabase/PostgREST devuelven errores como objetos planos
 * { message, details, hint, code } que NO son instancias de Error,
 * por eso hay que inspeccionar sus propiedades manualmente.
 */
export function mensajeError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const partes = [o.message, o.details, o.hint]
      .filter((x): x is string => typeof x === 'string' && x.length > 0)
    const code = typeof o.code === 'string' ? ` [${o.code}]` : ''
    if (partes.length) return partes.join(' · ') + code
    try {
      return JSON.stringify(e)
    } catch {
      return 'Error desconocido'
    }
  }
  return 'Error desconocido'
}
