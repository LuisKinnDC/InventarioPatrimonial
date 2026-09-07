import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { FirmaConfig, Institucion, PadronActivoRow } from '@/types/database'

async function urlAImagen(
  url: string,
): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result as string)
      fr.readAsDataURL(blob)
    })
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.width, h: img.height })
      img.onerror = () => resolve({ w: 1, h: 1 })
      img.src = dataUrl
    })
    return { dataUrl, ...dims }
  } catch {
    return null
  }
}

/** Genera y descarga el reporte del padrón en PDF (formato horizontal). */
export async function exportarAnexo05Pdf(
  filas: PadronActivoRow[],
  institucion: Institucion | null,
  firmas: FirmaConfig[] = [],
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(institucion?.nombre_ie ?? 'INSTITUCIÓN', w / 2, 12, { align: 'center' })
  doc.setFontSize(11)
  doc.text('INVENTARIO FÍSICO DE BIENES PATRIMONIALES', w / 2, 20, {
    align: 'center',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(
    `Código: ${institucion?.codigo_modular ?? ''}   Responsable: ${
      institucion?.responsable ?? ''
    }`,
    14,
    29,
  )

  const total = filas.reduce((s, f) => s + Number(f.valor_libro ?? 0), 0)

  autoTable(doc, {
    startY: 34,
    styles: { fontSize: 6.5, cellPadding: 1 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 7 },
    head: [
      [
        'Nº',
        'COD.PAT.',
        'COD.INT.',
        'NOMBRE DEL BIEN',
        'CANT',
        'UBICACIÓN',
        'MARCA',
        'MODELO',
        'COLOR',
        'SERIE',
        'EST.',
        'PROC.',
        'FECHA',
        'VALOR',
      ],
    ],
    body: filas.map((f, i) => [
      i + 1,
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
      Number(f.valor_libro ?? 0).toFixed(2),
    ]),
    foot: [
      [
        { content: 'TOTAL S/.', colSpan: 13, styles: { halign: 'right' } },
        total.toFixed(2),
      ],
    ],
    footStyles: { fillColor: [226, 232, 240], textColor: 20, fontStyle: 'bold' },
  })

  // Firmas al pie de la última página
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y = (doc as any).lastAutoTable?.finalY ?? 40
  const h = doc.internal.pageSize.getHeight()
  if (y > h - 40) {
    doc.addPage()
    y = 20
  }
  y += 20

  const activas = firmas.filter((f) => f.activo !== false)
  if (activas.length) {
    const anchoCol = w / activas.length
    for (let i = 0; i < activas.length; i++) {
      const fi = activas[i]
      const cx = anchoCol * i + anchoCol / 2
      if (fi.firma_url) {
        const img = await urlAImagen(fi.firma_url)
        if (img) {
          const iw = 35
          const ih = (img.h / img.w) * iw
          doc.addImage(img.dataUrl, 'PNG', cx - iw / 2, y - ih, iw, ih)
        }
      }
      doc.setDrawColor(120)
      doc.line(cx - 30, y + 2, cx + 30, y + 2)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(fi.nombre_responsable || '', cx, y + 7, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.text(fi.cargo, cx, y + 11, { align: 'center' })
    }
  }

  doc.save(`Inventario_${new Date().toISOString().slice(0, 10)}.pdf`)
}
