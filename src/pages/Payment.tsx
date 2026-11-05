import { ArrowLeft } from 'lucide-react'
import type { UpiPayload } from '../types'
import { AmountInput } from '../components/AmountInput'

interface PaymentPageProps {
  payload: UpiPayload
  onBack: () => void
  onPay: (amount: number) => void
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'UP'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

/** Payee summary and amount entry. */
export function PaymentPage({ payload, onBack, onPay }: PaymentPageProps) {
  return (
    <div className="px-5 pb-4 pt-3">
      <header className="flex h-11 items-center">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-paper-2 hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
        </button>
        <span className="ml-3 label">Pay</span>
      </header>

      <div className="mt-6 flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-paper-2 text-base font-semibold text-ink-soft">
          {initials(payload.merchantName)}
        </span>
        <h1 className="mt-3 max-w-full font-display text-2xl leading-tight text-ink">
          {payload.merchantName}
        </h1>
        <p className="mt-1 max-w-full truncate text-xs text-ink-faint">
          {payload.payeeUpiId}
        </p>
        {payload.note && (
          <p className="mt-2 text-xs text-ink-soft">{payload.note}</p>
        )}
      </div>

      <AmountInput initialAmount={payload.amount} onContinue={onPay} />
    </div>
  )
}
