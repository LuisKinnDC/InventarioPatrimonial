import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { Icon } from '@/components/Icon'

/** Formatos de código de barras 1D típicos en etiquetas patrimoniales. */
const FORMATOS_BARRA = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
]

/**
 * Escáner por cámara. Dos modos:
 *  - modo="qr"    → apertura cuadrada (QR y barras).
 *  - modo="barra" → apertura en franja horizontal DELGADA, ideal para el
 *                   código de barras (que es angosto), con lectura 1D priorizada.
 * Al leer un código invoca onDetected(codigo) una sola vez y se cierra.
 */
export function ScannerCamara({
  open,
  onClose,
  onDetected,
  modo = 'qr',
}: {
  open: boolean
  onClose: () => void
  onDetected: (codigo: string) => void
  modo?: 'qr' | 'barra'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const yaLeido = useRef(false)
  const onDetectedRef = useRef(onDetected)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onDetectedRef.current = onDetected
  })

  useEffect(() => {
    if (!open) return
    yaLeido.current = false

    const hints = new Map()
    if (modo === 'barra') {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATOS_BARRA)
      hints.set(DecodeHintType.TRY_HARDER, true)
    }
    const reader = new BrowserMultiFormatReader(hints)

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result, err, controls) => {
          controlsRef.current = controls
          if (result && !yaLeido.current) {
            yaLeido.current = true
            controls.stop()
            onDetectedRef.current(result.getText())
          }
          void err
        },
      )
      .catch((e: unknown) => {
        setError(
          e instanceof Error && e.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Habilítalo en el navegador.'
            : 'No se pudo acceder a la cámara.',
        )
      })

    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [open, modo])

  if (!open) return null

  const esBarra = modo === 'barra'

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-space-base">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-space-base top-space-base rounded-full bg-white/10 p-space-sm text-white hover:bg-white/20"
        aria-label="Cerrar cámara"
      >
        <Icon name="close" className="text-2xl" />
      </button>

      <div className="mb-space-md flex items-center gap-space-xs font-label-md text-label-md uppercase tracking-wider text-emerald-400">
        <Icon name={esBarra ? 'barcode_scanner' : 'qr_code_scanner'} className="text-lg" />
        {esBarra ? 'Alinea el código de barras' : 'Apunta la cámara al código'}
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-xl bg-black shadow-2xl ${
          esBarra ? 'max-w-2xl' : 'max-w-md aspect-square'
        }`}
        style={esBarra ? { aspectRatio: '16 / 9' } : undefined}
      >
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

        {!error &&
          (esBarra ? (
            /* Apertura DELGADA para código de barras: franja horizontal central */
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-20 w-[85%] rounded-md shadow-[0_0_0_2000px_rgba(0,0,0,0.55)] ring-2 ring-emerald-400/80">
                <div className="scanner-line absolute left-2 right-2 h-0.5 bg-red-500" />
                {/* esquinas */}
                <span className="absolute -left-0.5 -top-0.5 h-3 w-3 border-l-2 border-t-2 border-emerald-300" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 border-r-2 border-t-2 border-emerald-300" />
                <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 border-b-2 border-l-2 border-emerald-300" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-b-2 border-r-2 border-emerald-300" />
              </div>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-white/40" />
              <div className="scanner-line pointer-events-none absolute left-6 right-6 h-0.5 bg-red-500" />
            </>
          ))}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-space-sm p-space-lg text-center text-white">
            <Icon name="videocam_off" className="text-4xl text-red-400" />
            <p className="font-body-sm text-body-sm">{error}</p>
          </div>
        )}
      </div>

      <p className="mt-space-md max-w-md text-center font-body-sm text-body-sm text-white/60">
        {esBarra
          ? 'Acerca el lector y centra la barra dentro de la franja hasta que se detecte.'
          : 'Compatible con códigos QR y de barras (Code 128, EAN, Code 39, entre otros).'}
      </p>
    </div>
  )
}
