import type { UpiPayload } from '../types'
import { QRScanner } from '../components/QRScanner'

interface ScannerPageProps {
  onScan: (payload: UpiPayload) => void
  onClose: () => void
}

/** Full-screen camera scanner with gallery and manual UPI fallbacks. */
export function ScannerPage({ onScan, onClose }: ScannerPageProps) {
  return <QRScanner onScan={onScan} onClose={onClose} />
}
