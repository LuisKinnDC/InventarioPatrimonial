import ExcelJS from 'exceljs'
import type { FirmaConfig, Institucion, PadronActivoRow } from '@/types/database'

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

const COLS = [
  { header: 'Nº', key: 'n', width: 5 },
  { header: 'COD.PAT.', key: 'cp', width: 15 },
  { header: 'COD.INT.', key: 'ci', width: 10 },
  { header: 'NOMBRE DEL BIEN', key: 'den', width: 38 },
  { header: 'CANT', key: 'cant', width: 6 },
  { header: 'UBICACIÓN FÍSICA', key: 'ubi', width: 20 },
  { header: 'MARCA', key: 'marca', width: 14 },
  { header: 'MODELO', key: 'modelo', width: 14 },
  { header: 'COLOR', key: 'color', width: 12 },
  { header: 'SERIE', key: 'serie', width: 16 },
  { header: 'EST.', key: 'est', width: 6 },
  { header: 'PROCED.', key: 'proc', width: 12 },
  { header: 'FECHA INGRESO', key: 'fecha', width: 14 },
  { header: 'VALOR EN LIBRO', key: 'valor', width: 14 },
  { header: 'OBS.', key: 'obs', width: 18 },
]

/** Genera y descarga el Anexo 05 en Excel con encabezado institucional y firmas. */
export async function exportarAnexo05Excel(
  filas: PadronActivoRow[],
  institucion: Institucion | null,
  firmas: FirmaConfig[] = [],
) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema de Inventario Patrimonial'
  const ws = wb.addWorksheet('INVENTARIO', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const nCols = COLS.length
  const lastCol = String.fromCharCode(64 + nCols) // 'O'

  const tituloRow = (texto: string, size = 11, bold = true) => {
    const row = ws.addRow([texto])
    ws.mergeCells(`A${row.number}:${lastCol}${row.number}`)
    row.getCell(1).font = { bold, size }
    row.getCell(1).alignment = { horizontal: 'center' }
    return row
  }

  tituloRow(institucion?.nombre_ie ?? 'INSTITUCIÓN', 13)
  tituloRow('INVENTARIO FÍSICO DE BIENES PATRIMONIALES', 12)
  ws.addRow([])

  // Metadatos institucionales
  const meta: [string, string][] = [
    ['INSTITUCIÓN:', institucion?.nombre_ie ?? ''],
    ['CÓDIGO:', institucion?.codigo_modular ?? ''],
    ['RESPONSABLE:', institucion?.responsable ?? ''],
    ['CARGO:', institucion?.cargo ?? ''],
    [
      'UBICACIÓN:',
      [institucion?.departamento, institucion?.provincia, institucion?.distrito]
        .filter(Boolean)
        .join(' / '),
    ],
  ]
  for (const [k, v] of meta) {
    const row = ws.addRow([k, v])
    row.getCell(1).font = { bold: true, size: 10 }
  }
  ws.addRow([])

  // Encabezado de la tabla
  const headerRow = ws.addRow(COLS.map((c) => c.header))
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6D1F38' },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })
  COLS.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width
  })

  // Datos
  filas.forEach((f, idx) => {
    const row = ws.addRow([
      idx + 1,
      f.codigo_patrimonial ?? '',
      f.codigo_interno ?? '',
      f.denominacion,
      f.cantidad,
      f.ubicacion ?? '',
      f.marca ?? '',
      f.modelo ?? '',
      f.color ?? '',
      f.serie ?? '',
      f.estado_conservacion ?? '',
      f.procedencia ?? '',
      f.fecha_ingreso ?? '',
      Number(f.valor_libro ?? 0),
      f.observaciones ?? '',
    ])
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'hair' },
        left: { style: 'hair' },
        bottom: { style: 'hair' },
        right: { style: 'hair' },
      }
      cell.font = { size: 9 }
    })
    row.getCell(14).numFmt = '#,##0.00'
  })

  // Total valorización
  const total = filas.reduce((s, f) => s + Number(f.valor_libro ?? 0), 0)
  const totalRow = ws.addRow([])
  totalRow.getCell(13).value = 'TOTAL S/.'
  totalRow.getCell(13).font = { bold: true }
  totalRow.getCell(14).value = total
  totalRow.getCell(14).numFmt = '#,##0.00'
  totalRow.getCell(14).font = { bold: true }

  // Firmas al pie
  ws.addRow([])
  ws.addRow([])
  if (firmas.length) {
    const cargos = ws.addRow(firmas.map((fi) => fi.nombre_responsable || ''))
    cargos.eachCell((c) => (c.alignment = { horizontal: 'center' }))
    const cargoRow = ws.addRow(firmas.map((fi) => `_________________\n${fi.cargo}`))
    cargoRow.eachCell(
      (c) => (c.alignment = { horizontal: 'center', wrapText: true }),
    )
  }

  const buf = await wb.xlsx.writeBuffer()
  descargar(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}
