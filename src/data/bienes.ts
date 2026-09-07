import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { Bien, BienInput, EstadoConservacion } from '@/types/database'

export interface FiltrosBienes {
  texto?: string
  ubicacionId?: string | null
  categoriaId?: number | null
  estado?: EstadoConservacion | null
  soloActivos?: boolean
  page?: number
  pageSize?: number
}

export interface BienConRelaciones extends Bien {
  ubicacion?: { nombre_ambiente: string } | null
  categoria?: { nombre: string } | null
}

export interface ResultadoBienes {
  filas: BienConRelaciones[]
  total: number
}

const SELECT_REL =
  '*, ubicacion:ubicaciones(nombre_ambiente), categoria:categorias(nombre)'

export function useBienes(filtros: FiltrosBienes) {
  const {
    texto,
    ubicacionId,
    categoriaId,
    estado,
    soloActivos = true,
    page = 0,
    pageSize = 25,
  } = filtros

  return useQuery({
    queryKey: ['bienes', filtros],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<ResultadoBienes> => {
      let q = supabase.from('bienes').select(SELECT_REL, { count: 'exact' })

      if (soloActivos) q = q.eq('estado_registro', 'ACTIVO')
      if (ubicacionId) q = q.eq('ubicacion_id', ubicacionId)
      if (categoriaId) q = q.eq('categoria_id', categoriaId)
      if (estado) q = q.eq('estado_conservacion', estado)
      if (texto && texto.trim()) {
        const t = `%${texto.trim()}%`
        q = q.or(
          `denominacion.ilike.${t},marca.ilike.${t},serie.ilike.${t},codigo_patrimonial.ilike.${t},codigo_interno.ilike.${t}`,
        )
      }

      q = q
        .order('codigo_interno', { ascending: true, nullsFirst: false })
        .range(page * pageSize, page * pageSize + pageSize - 1)

      const { data, error, count } = await q
      if (error) throw error
      return { filas: (data ?? []) as unknown as BienConRelaciones[], total: count ?? 0 }
    },
  })
}

/** Busca un único bien por código patrimonial o interno (lector de barras/QR). */
export function useBuscarPorCodigo() {
  return useMutation({
    mutationFn: async (codigo: string): Promise<BienConRelaciones | null> => {
      const c = codigo.trim()
      const { data, error } = await supabase
        .from('bienes')
        .select(SELECT_REL)
        .or(`codigo_patrimonial.eq.${c},codigo_interno.eq.${c}`)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as unknown as BienConRelaciones | null
    },
  })
}

export function useCrearBien() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (bien: Partial<BienInput>): Promise<Bien> => {
      const { data, error } = await supabase.from('bienes').insert(bien).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bienes'] }),
  })
}

export function useActualizarBien() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      cambios,
    }: {
      id: string
      cambios: Partial<BienInput>
    }): Promise<Bien> => {
      const { data, error } = await supabase
        .from('bienes')
        .update(cambios)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bienes'] }),
  })
}

export function useEliminarBien() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bienes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bienes'] }),
  })
}

/** Inserción masiva por lotes (importación de Excel). */
export async function insertarBienesLote(
  bienes: Partial<BienInput>[],
  onProgress?: (hechos: number, total: number) => void,
): Promise<{ insertados: number }> {
  const CHUNK = 500
  let insertados = 0
  for (let i = 0; i < bienes.length; i += CHUNK) {
    const lote = bienes.slice(i, i + CHUNK)
    const { error } = await supabase.from('bienes').insert(lote)
    if (error) throw error
    insertados += lote.length
    onProgress?.(insertados, bienes.length)
  }
  return { insertados }
}
