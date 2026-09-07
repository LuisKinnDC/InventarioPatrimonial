import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type {
  Categoria,
  Institucion,
  NivelEducativo,
  Ubicacion,
} from '@/types/database'

/* ----------------------------- Ubicaciones ----------------------------- */
export function useUbicaciones() {
  return useQuery({
    queryKey: ['ubicaciones'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<Ubicacion[]> => {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*')
        .order('nombre_ambiente')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCrearUbicacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nombre_ambiente: string): Promise<Ubicacion> => {
      const { data, error } = await supabase
        .from('ubicaciones')
        .insert({ nombre_ambiente })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ubicaciones'] }),
  })
}

/* ------------------------------ Categorías ------------------------------ */
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<Categoria[]> => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')
      if (error) throw error
      return data ?? []
    },
  })
}

/* ---------------------------- Niveles educ. ---------------------------- */
export function useNiveles() {
  return useQuery({
    queryKey: ['niveles'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<NivelEducativo[]> => {
      const { data, error } = await supabase
        .from('niveles_educativos')
        .select('*')
        .order('id')
      if (error) throw error
      return data ?? []
    },
  })
}

/* ------------------------------ Institución ----------------------------- */
export function useInstitucion() {
  return useQuery({
    queryKey: ['institucion'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<Institucion | null> => {
      const { data, error } = await supabase.from('institucion').select('*').maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useGuardarInstitucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (inst: Partial<Institucion> & { id?: string }) => {
      const { error } = await supabase.from('institucion').upsert(inst)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institucion'] }),
  })
}
