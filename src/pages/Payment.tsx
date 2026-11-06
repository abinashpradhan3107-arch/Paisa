import { useState } from 'react'
import { ArrowLeft, Building2, Wallet } from 'lucide-react'
import type { PaymentDetails, UpiPayload } from '../types'
import { FUNDING_SOURCES } from '../utils/funding'
import { formatINR } from '../utils/upiParser'
import { parseAmount } from '../utils/amount'
import { initials } from '../utils/display'
import { AmountDisplay } from '../components/AmountDisplay'
import { AmountKeypad } from '../components/AmountKeypad'

interface PaymentPageProps {
  payload: UpiPayload
  initialAmount: number | null
  balance: number
  onBack: () => void
  onPay: (details: PaymentDetails) => void
}

/** Recipient summary, editable amount, note and simulated funding source. */
export function PaymentPage({
  payload,
  initialAmount,
  balance,
  onBack,
  onPay,
}: PaymentPageProps) {
  const [amount, setAmount] = useState(() =>
    initialAmount && initialAmount > 0 ? String(initialAmount) : '',
  )
  const [note, setNote] = useState(payload.note ?? '')
  const [fundingSource, setFundingSource] = useState<'wallet' | 'bank'>('wallet')
  const [error, setError] = useState<string | null>(null)

  const parsedAmount = parseAmount(amount)

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (error) setError(null)
  }

  const handlePay = () => {
    const nextAmount = parseAmount(amount)
    if (nextAmount === null) {
      setError('Enter an amount greater than ₹0.')
      return
    }
    if (fundingSource === 'wallet' && nextAmount > balance) {
      setError(
        'This is more than your simulated wallet balance. Choose the bank account or lower the amount.',
      )
      return
    }

    onPay({
      merchantName: payload.merchantName,
      payeeUpiId: payload.payeeUpiId,
      amount: nextAmount,
      note: note.trim() || undefined,
      fundingSource,
    })
  }

  return (
    <div className="animate-screen flex min-h-dvh flex-col px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-card hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="text-xs font-medium text-ink-soft">Pay</span>
        <span className="sim-pill">Simulation</span>
      </header>

      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-sm font-semibold tracking-wide text-accent">
          {initials(payload.merchantName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-ink">
            {payload.merchantName}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            {payload.payeeUpiId}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <p className="label text-center">Amount</p>
          {amount && (
            <button
              type="button"
              onClick={() => {
                setAmount('')
                if (error) setError(null)
              }}
              className="absolute right-0 top-0 text-[11px] font-medium text-ink-faint transition hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-1">
          <AmountDisplay value={amount} size="md" />
        </div>
      </div>

      <label htmlFor="payment-note" className="sr-only">
        Payment note
      </label>
      <input
        id="payment-note"
        type="text"
        maxLength={60}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Add a note (optional)"
        className="mt-5 h-12 w-full rounded-2xl border border-line bg-card px-4 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-line-strong"
      />

      <div className="mt-4">
        <p className="label">Paying from</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['wallet', 'bank'] as const).map((id) => {
            const source = FUNDING_SOURCES[id]
            const Icon = id === 'wallet' ? Wallet : Building2
            const active = fundingSource === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFundingSource(id)
                  if (error) setError(null)
                }}
                aria-pressed={active}
                className={`rounded-2xl border p-3 text-left transition duration-150 active:scale-[0.985] ${
                  active
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-card hover:border-line-strong'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? 'text-accent' : 'text-ink-soft'}`}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <p className="mt-2 truncate text-xs font-semibold text-ink">
                  {source.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                  {id === 'wallet' ? formatINR(balance) : source.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <AmountKeypad value={amount} onChange={handleAmountChange} />

        {error && (
          <p
            role="alert"
            className="animate-shake mt-3 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium leading-relaxed text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          className="btn-primary mt-3 w-full"
        >
          {parsedAmount ? `Pay ${formatINR(parsedAmount)}` : 'Enter amount to pay'}
        </button>
      </div>
    </div>
  )
}
