import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { Movimiento, TipoMovimiento } from '@/types/database'

export interface MovimientoConBien extends Movimiento {
  bien?: {
    denominacion: string
    codigo_interno: string | null
    codigo_patrimonial: string | null
  } | null
}

export function useMovimientos() {
  return useQuery({
    queryKey: ['movimientos'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<MovimientoConBien[]> => {
      const { data, error } = await supabase
        .from('movimientos')
        .select(
          '*, bien:bienes(denominacion, codigo_interno, codigo_patrimonial)',
        )
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return (data ?? []) as unknown as MovimientoConBien[]
    },
  })
}

export function useMovimientosDeBien(bienId: string | null) {
  return useQuery({
    queryKey: ['movimientos', bienId],
    enabled: supabaseConfigurado && !!bienId,
    queryFn: async (): Promise<Movimiento[]> => {
      const { data, error } = await supabase
        .from('movimientos')
        .select('*')
        .eq('bien_id', bienId!)
        .order('fecha', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export interface NuevoMovimiento {
  bien_id: string
  tipo: TipoMovimiento
  motivo?: string
  nro_resolucion?: string
  fecha?: string
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (mov: NuevoMovimiento) => {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('movimientos').insert({
        ...mov,
        registrado_por: userData.user?.id ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] })
      qc.invalidateQueries({ queryKey: ['bienes'] })
      qc.invalidateQueries({ queryKey: ['valorizacion'] })
    },
  })
}
