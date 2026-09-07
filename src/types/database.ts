/**
 * Tipos del modelo de datos del Sistema de Inventario Patrimonial (Anexo 05).
 * Reflejan el esquema de `supabase/migrations/`. Cuando el proyecto Supabase
 * esté conectado, se pueden regenerar con:
 *   pnpm dlx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type EstadoConservacion = 'B' | 'R' | 'M' | 'Y'
export type EstadoRegistro = 'ACTIVO' | 'BAJA'
export type TipoMovimiento = 'ALTA' | 'BAJA'
export type RolUsuario = 'ADMIN' | 'OPERADOR' | 'LECTOR'

export const ESTADO_CONSERVACION_LABEL: Record<EstadoConservacion, string> = {
  B: 'Bueno',
  R: 'Regular',
  M: 'Malo',
  Y: 'Chatarra / Baja',
}

export interface Institucion {
  id: string
  dre: string | null
  ugel: string | null
  nombre_ie: string
  codigo_modular: string | null
  responsable: string | null
  cargo: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
  localidad: string | null
  pisos: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface NivelEducativo {
  id: number
  nombre: string
}

export interface Categoria {
  id: number
  nombre: string
}

export interface Ubicacion {
  id: string
  nombre_ambiente: string
  nivel_id: number | null
  piso: string | null
  responsable: string | null
  created_at: string
  updated_at: string
}

export interface Bien {
  id: string
  codigo_patrimonial: string | null
  codigo_interno: string | null
  denominacion: string
  cantidad: number
  ubicacion_id: string | null
  categoria_id: number | null
  marca: string | null
  modelo: string | null
  color: string | null
  serie: string | null
  estado_conservacion: EstadoConservacion | null
  procedencia: string | null
  fecha_ingreso: string | null
  valor_libro: number
  observaciones: string | null
  estado_registro: EstadoRegistro
  es_baja: boolean
  created_at: string
  updated_at: string
}

/** Bien para crear/editar (sin campos generados por la BD). */
export type BienInput = Omit<
  Bien,
  'id' | 'es_baja' | 'created_at' | 'updated_at'
>

export interface Movimiento {
  id: string
  bien_id: string
  tipo: TipoMovimiento
  motivo: string | null
  nro_resolucion: string | null
  documento_url: string | null
  fecha: string
  registrado_por: string | null
  created_at: string
}

export interface FirmaConfig {
  id: string
  cargo: string
  nombre_responsable: string
  firma_url: string | null
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Perfil {
  id: string
  nombre: string | null
  rol: RolUsuario
  activo: boolean
  created_at: string
  updated_at: string
}

/** Fila de la vista v_padron_activo (para exportar el Anexo 05). */
export interface PadronActivoRow {
  id: string
  codigo_patrimonial: string | null
  codigo_interno: string | null
  denominacion: string
  cantidad: number
  ubicacion: string | null
  nivel_id: number | null
  nivel: string | null
  categoria: string | null
  marca: string | null
  modelo: string | null
  color: string | null
  serie: string | null
  estado_conservacion: EstadoConservacion | null
  procedencia: string | null
  fecha_ingreso: string | null
  valor_libro: number
  observaciones: string | null
}
