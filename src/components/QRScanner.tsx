import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  CameraOff,
  Check,
  Image as ImageIcon,
  Keyboard,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import type { QrScanErrorType, UpiPayload } from '../types'
import { parseUpiPayload } from '../utils/upiParser'
import { ManualUpiForm } from './ManualUpiForm'
import { Sheet } from './Sheet'

type ScannerStatus = 'starting' | 'scanning' | 'success' | 'error'

interface ScannerError {
  type: QrScanErrorType
  message: string
  hint?: string
}

interface QRScannerProps {
  onScan: (payload: UpiPayload) => void
  onClose: () => void
}

function classifyCameraError(error: unknown): ScannerError {
  const text = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase()

  if (
    text.includes('permission') ||
    text.includes('notallowed') ||
    text.includes('denied')
  ) {
    return {
      type: 'permission-denied',
      message: 'Camera access was denied',
      hint: 'Allow camera access in your browser settings, then try again. You can also upload a QR image.',
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
      message: 'No camera found',
      hint: 'Connect a camera, upload a QR image, or enter the UPI ID instead.',
    }
  }

  return {
    type: 'scanner-error',
    message: 'The camera could not start',
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
 * Full-screen QR scanner. Handles camera permissions, image upload and manual
 * UPI entry, and only ever parses UPI payloads locally.
 */
export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const reactId = useId()
  const elementId = `curie-qr-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  const onCloseRef = useRef(onClose)
  const lastInvalidRef = useRef<{ text: string; at: number } | null>(null)
  const successTimerRef = useRef<number | null>(null)
  const decodedRef = useRef(false)

  const [status, setStatus] = useState<ScannerStatus>(() =>
    cameraSupported() ? 'starting' : 'error',
  )
  const [error, setError] = useState<ScannerError | null>(() =>
    cameraSupported()
      ? null
      : {
          type: 'camera-unavailable',
          message: 'Camera access is unavailable',
          hint: 'Browsers only expose the camera on HTTPS or localhost. Upload a QR image or enter the UPI ID instead.',
        },
  )
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)

  useEffect(() => {
    onScanRef.current = onScan
    onCloseRef.current = onClose
  }, [onScan, onClose])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current)
      }
    }
  }, [])

  const handleDecoded = useCallback((decodedText: string) => {
    if (decodedRef.current) return
    try {
      const payload = parseUpiPayload(decodedText)
      decodedRef.current = true
      setStatus('success')
      setInlineError(null)
      const scanner = scannerRef.current
      scannerRef.current = null
      void stopScanner(scanner)
      successTimerRef.current = window.setTimeout(() => {
        onScanRef.current(payload)
      }, 420)
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
            const edge = Math.floor(Math.min(width, height) * 0.68)
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
    decodedRef.current = false
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

    decodedRef.current = false
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
        message: 'No QR code found in that image',
        hint: 'Try a sharper, well-lit photo, or use the camera instead.',
      })
      setStatus('error')
    }
  }

  const handleManualScan = (payload: UpiPayload) => {
    setManualOpen(false)
    onScanRef.current(payload)
  }

  const busy = status === 'starting' || status === 'success'

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-black">
        <div id={elementId} className="qr-reader absolute inset-0" />

        {/* Dim everything except the scan window. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-[70%] max-w-[300px]">
            <div
              className="absolute inset-0 rounded-[30px] border border-white/10"
              style={{ boxShadow: '0 0 0 100vmax rgba(0,0,0,0.64)' }}
            />
            {[
              'left-0 top-0 border-l-2 border-t-2 rounded-tl-[26px]',
              'right-0 top-0 border-r-2 border-t-2 rounded-tr-[26px]',
              'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[26px]',
              'right-0 bottom-0 border-r-2 border-b-2 rounded-br-[26px]',
            ].map((position) => (
              <span
                key={position}
                className={`absolute h-10 w-10 border-accent ${position}`}
              />
            ))}
            {status === 'scanning' && (
              <span className="absolute left-5 right-5 h-px animate-scanline bg-accent/80 shadow-[0_0_12px_rgba(201,242,124,0.7)]" />
            )}
          </div>
        </div>

        {/* Top bar */}
        <header className="relative z-20 flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="glass-btn h-11 w-11 rounded-full"
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
          </button>
          <div className="rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            Scan QR
          </div>
          <span className="h-11 w-11" aria-hidden="true" />
        </header>

        {status === 'starting' && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <div className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-center backdrop-blur-md">
              <Loader2
                className="mx-auto h-5 w-5 animate-spin text-accent"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs text-white/75">Starting camera…</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-sm">
            <div className="animate-fade-up text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-on-accent">
                <Check
                  className="h-8 w-8"
                  strokeWidth={2.6}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-4 text-sm font-semibold text-white">
                QR code detected
              </p>
              <p className="mt-1 text-xs text-white/60">
                Opening payment…
              </p>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 px-6 backdrop-blur-sm">
            <div className="w-full max-w-[320px] rounded-3xl border border-white/10 bg-card/95 p-5 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card-2 text-ink-soft">
                <CameraOff
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                {error.message}
              </p>
              {error.hint && (
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {error.hint}
                </p>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="btn-quiet mt-4 h-11 w-full"
              >
                <RefreshCw
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Try camera again
              </button>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="relative z-20 mt-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="rounded-3xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl">
            <p className="text-center text-sm font-medium text-white">
              Align the QR code inside the frame
            </p>

            {inlineError && (
              <p
                role="alert"
                className="mt-3 animate-shake rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-center text-xs font-medium text-danger"
              >
                {inlineError}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label
                className={`glass-btn h-12 cursor-pointer ${
                  busy ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <ImageIcon
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Gallery
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
                onClick={() => setManualOpen(true)}
                className="glass-btn h-12"
              >
                <Keyboard
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Enter UPI ID
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sheet
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Pay a UPI ID"
      >
        <ManualUpiForm autoFocus onSubmit={handleManualScan} />
      </Sheet>
    </div>
  )
}
