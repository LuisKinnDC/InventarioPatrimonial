import * as XLSX from 'xlsx'
import type { EstadoConservacion } from '@/types/database'

/** Fila normalizada leída del Excel Anexo 05 (ubicación aún como texto). */
export interface FilaImportada {
  fila: number
  codigo_patrimonial: string | null
  codigo_interno: string | null
  denominacion: string
  cantidad: number
  ubicacionNombre: string | null
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

export interface ResultadoParseo {
  filas: FilaImportada[]
  descartadas: number
  hoja: string
}

const clean = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

const toNumber = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Normaliza el estado de conservación a los códigos oficiales B/R/M/Y. */
export function normalizarEstado(v: unknown): EstadoConservacion | null {
  const s = clean(v)?.toUpperCase()
  if (!s) return null
  const c = s[0]
  if (c === 'B' || c === 'R' || c === 'M' || c === 'Y') return c
  return null // valores atípicos (N, D, C…) quedan sin estado
}

/** Convierte fecha de Excel (serial o texto) a ISO yyyy-mm-dd. */
function parseFecha(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    if (d) {
      const mm = String(d.m).padStart(2, '0')
      const dd = String(d.d).padStart(2, '0')
      return `${d.y}-${mm}-${dd}`
    }
  }
  const s = String(v).trim()
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

/** Localiza la fila de encabezado buscando "NOMBRE DEL BIEN". */
function encontrarEncabezado(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const joined = (rows[i] ?? []).map((c) => String(c ?? '').toUpperCase()).join(' ')
    if (joined.includes('NOMBRE DEL BIEN')) return i
  }
  return 12 // fallback: fila 13 (índice 12) según el Anexo 05 estándar
}

/**
 * Lee un archivo .xlsx con formato Anexo 05 y devuelve las filas normalizadas.
 * Mapea por posición de columna: A=Nº, B=COD.PAT., C=COD.INT., D=NOMBRE, E=CANT,
 * F=UBICACIÓN, G=MARCA, H=MODELO, I=COLOR, J=SERIE, K=EST., L=PROCEDENCIA,
 * M=FECHA, N=VALOR, O=OBS.
 */
export async function parsearAnexo05(file: File): Promise<ResultadoParseo> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { cellDates: true })
  const hoja = wb.SheetNames[0]
  const ws = wb.Sheets[hoja]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false })

  const headerIdx = encontrarEncabezado(rows)
  const filas: FilaImportada[] = []
  let descartadas = 0

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? []
    const denominacion = clean(r[3])
    // Descartar filas sin nombre de bien (separadores, subtítulos, vacías)
    if (!denominacion) {
      descartadas++
      continue
    }
    filas.push({
      fila: i + 1,
      codigo_patrimonial: clean(r[1]),
      codigo_interno: clean(r[2]),
      denominacion,
      cantidad: Math.max(1, Math.round(toNumber(r[4]) || 1)),
      ubicacionNombre: clean(r[5]),
      marca: clean(r[6]),
      modelo: clean(r[7]),
      color: clean(r[8]),
      serie: clean(r[9]),
      estado_conservacion: normalizarEstado(r[10]),
      procedencia: clean(r[11]),
      fecha_ingreso: parseFecha(r[12]),
      valor_libro: toNumber(r[13]),
      observaciones: clean(r[14]),
    })
  }

  return { filas, descartadas, hoja }
}
