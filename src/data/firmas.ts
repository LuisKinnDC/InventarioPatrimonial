import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { FirmaConfig } from '@/types/database'

const BUCKET = 'firmas'

export function useFirmas() {
  return useQuery({
    queryKey: ['firmas'],
    enabled: supabaseConfigurado,
    queryFn: async (): Promise<FirmaConfig[]> => {
      const { data, error } = await supabase
        .from('firmas_config')
        .select('*')
        .order('orden')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useGuardarFirma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (firma: Partial<FirmaConfig> & { id?: string }) => {
      const { error } = await supabase.from('firmas_config').upsert(firma)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['firmas'] }),
  })
}

/** Sube un PNG al bucket `firmas` y devuelve la URL pública. */
export function useSubirImagenFirma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      file,
    }: {
      id: string
      file: File
    }): Promise<string> => {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const firma_url = `${data.publicUrl}?v=${Date.now()}`

      const { error: updErr } = await supabase
        .from('firmas_config')
        .update({ firma_url })
        .eq('id', id)
      if (updErr) throw updErr
      return firma_url
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['firmas'] }),
  })
}
