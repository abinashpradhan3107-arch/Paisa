import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { CameraOff, Check, Loader2, RefreshCw, Upload } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import type { UpiPayload, QrScanErrorType } from '../types'
import { parseUpiPayload } from '../utils/upiParser'

type ScannerStatus = 'starting' | 'scanning' | 'success' | 'error'

interface ScannerError {
  type: QrScanErrorType
  message: string
  hint?: string
}

interface QRScannerProps {
  /** Called once a valid UPI QR payload has been decoded. */
  onScan: (payload: UpiPayload) => void
}

function classifyCameraError(error: unknown): ScannerError {
  const text = (error instanceof Error ? error.message : String(error)).toLowerCase()

  if (
    text.includes('permission') ||
    text.includes('notallowed') ||
    text.includes('denied')
  ) {
    return {
      type: 'permission-denied',
      message: 'Camera access was denied.',
      hint: 'Allow camera access in your browser settings, then try again.',
    }
  }

  if (
    text.includes('notfound') ||
    text.includes('no camera') ||
    text.includes('requested device not found') ||
    text.includes('overconstrained') ||
    text.includes('could not start video source')
  ) {
    return {
      type: 'camera-unavailable',
      message: 'No camera found.',
      hint: 'Connect a camera, upload a QR image, or enter the UPI ID below.',
    }
  }

  return {
    type: 'scanner-error',
    message: 'The camera could not start.',
    hint: 'Close any other app using the camera, then retry or upload an image.',
  }
}

async function stopScanner(scanner: Html5Qrcode | null): Promise<void> {
  if (!scanner) return
  try {
    await scanner.stop()
  } catch {
    // Already stopped.
  }
  try {
    scanner.clear()
  } catch {
    // Element may already be gone.
  }
}

function cameraSupported(): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

/**
 * Camera QR scanner with graceful permission handling and an image-upload
 * fallback. The decoded text is parsed as a UPI URI; invalid codes are
 * reported inline without leaving the scanner.
 */
export function QRScanner({ onScan }: QRScannerProps) {
  const reactId = useId()
  const elementId = `curie-qr-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  const lastInvalidRef = useRef<{ text: string; at: number } | null>(null)

  const [status, setStatus] = useState<ScannerStatus>(() =>
    cameraSupported() ? 'starting' : 'error',
  )
  const [error, setError] = useState<ScannerError | null>(() =>
    cameraSupported()
      ? null
      : {
          type: 'camera-unavailable',
          message: 'Camera access is unavailable.',
          hint: 'Browsers only expose the camera on HTTPS or localhost. Upload an image or enter the UPI ID below.',
        },
  )
  const [inlineError, setInlineError] = useState<string | null>(null)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const handleDecoded = useCallback((decodedText: string) => {
    try {
      const payload = parseUpiPayload(decodedText)
      setStatus('success')
      setInlineError(null)
      const scanner = scannerRef.current
      scannerRef.current = null
      void stopScanner(scanner)
      onScanRef.current(payload)
    } catch (parseError) {
      const now = Date.now()
      const last = lastInvalidRef.current
      if (last && last.text === decodedText && now - last.at < 2500) return
      lastInvalidRef.current = { text: decodedText, at: now }
      setInlineError(
        parseError instanceof Error
          ? parseError.message
          : 'That is not a valid UPI code.',
      )
      setStatus('scanning')
    }
  }, [])

  const startCamera = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (width, height) => {
            const edge = Math.floor(Math.min(width, height) * 0.72)
            return { width: edge, height: edge }
          },
          aspectRatio: 1,
        },
        (decodedText) => handleDecoded(decodedText),
        () => {
          // Frames without a QR code are normal.
        },
      )

      if (scannerRef.current !== scanner) {
        await stopScanner(scanner)
        return
      }
      setStatus('scanning')
    } catch (startError) {
      if (scannerRef.current !== scanner) return
      setError(classifyCameraError(startError))
      setStatus('error')
    }
  }, [handleDecoded])

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      useBarCodeDetectorIfSupported: true,
    })
    scannerRef.current = scanner

    const startTimer = cameraSupported()
      ? window.setTimeout(() => {
          void startCamera()
        }, 0)
      : null

    return () => {
      if (startTimer !== null) window.clearTimeout(startTimer)
      scannerRef.current = null
      void stopScanner(scanner)
    }
  }, [elementId, startCamera])

  const handleRetry = async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    setInlineError(null)
    setError(null)
    setStatus('starting')
    await stopScanner(scanner)
    await startCamera()
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const scanner = scannerRef.current
    if (!file || !scanner) return

    setInlineError(null)
    setError(null)
    setStatus('starting')
    await stopScanner(scanner)

    try {
      const decodedText = await scanner.scanFile(file, false)
      handleDecoded(decodedText)
    } catch {
      setError({
        type: 'invalid-qr',
        message: 'No QR code found in that image.',
        hint: 'Try a sharper, well-lit photo, or use the camera instead.',
      })
      setStatus('error')
    }
  }

  const statusText =
    status === 'scanning'
      ? 'Align the code inside the frame'
      : status === 'starting'
        ? 'Starting camera…'
        : status === 'success'
          ? 'Code detected'
          : 'Camera unavailable'

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink sm:aspect-square">
        <div id={elementId} className="qr-reader h-full w-full" />

        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-[12%] rounded-xl border border-paper/10" />
          {[
            'left-[12%] top-[12%] border-l border-t',
            'right-[12%] top-[12%] border-r border-t',
            'left-[12%] bottom-[12%] border-l border-b',
            'right-[12%] bottom-[12%] border-r border-b',
          ].map((position) => (
            <span
              key={position}
              className={`absolute h-7 w-7 border-paper/70 ${position}`}
            />
          ))}
          {status === 'scanning' && (
            <span className="absolute left-[14%] right-[14%] h-px animate-scanline bg-paper/60" />
          )}
        </div>

        {status === 'starting' && (
          <div className="absolute inset-0 grid place-items-center bg-ink/80 text-center text-paper">
            <div>
              <Loader2
                className="mx-auto h-6 w-6 animate-spin text-paper/70"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs text-paper/70">Starting camera…</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 grid place-items-center bg-ink/90 text-center text-paper">
            <div>
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-on-accent">
                <Check
                  className="h-5 w-5"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-3 text-sm font-medium">Code detected</p>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="absolute inset-0 grid place-items-center bg-ink/90 p-6 text-center text-paper">
            <div>
              <CameraOff
                className="mx-auto h-6 w-6 text-paper/60"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium">{error.message}</p>
              {error.hint && (
                <p className="mt-1 text-xs leading-relaxed text-paper/60">
                  {error.hint}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2.5 text-xs font-medium text-ink-soft transition hover:bg-paper-2 hover:text-ink">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Upload image
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
            aria-label="Upload a QR code image"
          />
        </label>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2.5 text-xs font-medium text-ink-soft transition hover:bg-paper-2 hover:text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>

      <p
        className="mt-2 text-center text-[11px] text-ink-faint"
        aria-live="polite"
      >
        {statusText}
      </p>

      {inlineError && (
        <p
          role="alert"
          className="mt-2 animate-shake text-center text-xs font-medium text-danger"
        >
          {inlineError}
        </p>
      )}
    </div>
  )
}
