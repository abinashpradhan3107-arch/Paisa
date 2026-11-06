import { useState } from 'react'
import { ScanLine, Wallet } from 'lucide-react'
import type { Transaction, UpiPayload } from '../types'
import { formatINR } from '../utils/upiParser'
import { parseAmount } from '../utils/amount'
import { AmountDisplay } from '../components/AmountDisplay'
import { AmountKeypad } from '../components/AmountKeypad'
import { ManualUpiForm } from '../components/ManualUpiForm'
import { Sheet } from '../components/Sheet'
import { TransactionItem } from '../components/TransactionItem'

interface HomeProps {
  transactions: Transaction[]
  balance: number
  amount: string
  onAmountChange: (value: string) => void
  onScan: () => void
  onStartPayment: (payload: UpiPayload) => void
  onOpenTransaction: (transaction: Transaction) => void
  onViewHistory: () => void
}

/**
 * Payment home: simulated balance, a large amount readout, the keypad and one
 * clear route into the scanner.
 */
export function Home({
  transactions,
  balance,
  amount,
  onAmountChange,
  onScan,
  onStartPayment,
  onOpenTransaction,
  onViewHistory,
}: HomeProps) {
  const [manualOpen, setManualOpen] = useState(false)
  const parsedAmount = parseAmount(amount)

  return (
    <div className="animate-screen min-h-dvh px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <span className="font-display text-[28px] leading-none tracking-[-0.01em] text-ink">
          curie
        </span>
        <span className="sim-pill">Simulated</span>
      </header>

      <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="label">Simulated balance</p>
          <p className="mt-1 truncate font-display text-[26px] leading-none tabular-nums text-ink">
            {formatINR(balance)}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card-2 px-2.5 py-1 text-[10px] font-medium text-ink-soft">
          <Wallet className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
          Wallet
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="label">Amount</p>
        {amount && (
          <button
            type="button"
            onClick={() => onAmountChange('')}
            className="text-[11px] font-medium text-ink-faint transition hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-1">
        <AmountDisplay value={amount} />
      </div>

      <div className="mt-2">
        <AmountKeypad value={amount} onChange={onAmountChange} />
      </div>

      <button
        type="button"
        onClick={onScan}
        aria-label="Open QR scanner"
        className="btn-primary mt-4 w-full"
      >
        <ScanLine className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
        {parsedAmount ? `Scan to pay ${formatINR(parsedAmount)}` : 'Scan a QR code'}
      </button>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="btn-ghost min-h-11 px-2 text-xs"
        >
          or pay a UPI ID
        </button>
      </div>

      {transactions.length > 0 && (
        <section className="mt-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="label">Recent</h2>
            <button
              type="button"
              onClick={onViewHistory}
              className="btn-ghost min-h-11 px-1 text-[11px]"
            >
              See all
            </button>
          </div>
          <ul className="mt-1 divide-y divide-line/60">
            {transactions.slice(0, 3).map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onOpen={onOpenTransaction}
              />
            ))}
          </ul>
        </section>
      )}

      <Sheet
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Pay a UPI ID"
      >
        <ManualUpiForm
          autoFocus
          onSubmit={(payload) => {
            setManualOpen(false)
            onStartPayment(payload)
          }}
        />
      </Sheet>
    </div>
  )
}
