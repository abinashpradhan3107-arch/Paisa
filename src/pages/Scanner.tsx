import type { UpiPayload } from '../types'
import { ManualUpiForm } from '../components/ManualUpiForm'
import { QRScanner } from '../components/QRScanner'

interface ScannerPageProps {
  onScan: (payload: UpiPayload) => void
}

/** Focused scanning screen with camera, image upload and manual entry. */
export function ScannerPage({ onScan }: ScannerPageProps) {
  return (
    <div className="px-5 pb-28 pt-6 md:pb-10">
      <header>
        <h1 className="font-display text-[40px] leading-none tracking-[-0.01em] text-ink">
          Scan
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Point your camera at a UPI QR code.
        </p>
      </header>

      <div className="mt-5">
        <QRScanner onScan={onScan} />
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="label">Pay a UPI ID</h2>
          <span className="text-[11px] text-ink-faint">No QR needed</span>
        </div>
        <ManualUpiForm onSubmit={onScan} />
      </section>
    </div>
  )
}
