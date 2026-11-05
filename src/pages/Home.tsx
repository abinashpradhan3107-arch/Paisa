import { useEffect, useState } from 'react'
import { ArrowUpRight, ScanLine } from 'lucide-react'
import type { Transaction, UpiPayload } from '../types'
import { formatINR } from '../utils/upiParser'
import { ManualUpiForm } from '../components/ManualUpiForm'
import { TransactionItem } from '../components/TransactionItem'

interface HomeProps {
  transactions: Transaction[]
  onScan: () => void
  onStartPayment: (payload: UpiPayload) => void
  onViewHistory: () => void
}

function greeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Landing screen: one primary action, manual entry and recent activity. */
export function Home({
  transactions,
  onScan,
  onStartPayment,
  onViewHistory,
}: HomeProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const monthTotal = transactions
    .filter((item) => {
      const date = new Date(item.timestamp)
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, item) => sum + item.amount, 0)

  const recent = transactions.slice(0, 4)

  return (
    <div className="px-5 pb-28 pt-6 md:pb-10">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="label">{todayLabel(now)}</p>
          <h1 className="mt-2 font-display text-[40px] leading-[0.95] tracking-[-0.01em] text-ink">
            {greeting(now)}.
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="label">This month</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-ink">
            {formatINR(monthTotal)}
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={onScan}
        className="group mt-7 flex w-full items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-5 text-left text-paper transition active:scale-[0.99]"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/55">
            Scan to pay
          </span>
          <span className="mt-2 block font-display text-2xl leading-tight">
            Point at any UPI QR
          </span>
        </span>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-paper/20 transition group-hover:bg-paper/10">
          <ScanLine className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
      </button>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="label">Pay a UPI ID</h2>
          <span className="text-[11px] text-ink-faint">No QR needed</span>
        </div>
        <ManualUpiForm onSubmit={onStartPayment} />
      </section>

      <section className="mt-9">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="label">Recent</h2>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={onViewHistory}
              className="inline-flex items-center gap-0.5 text-xs text-ink-soft underline decoration-line underline-offset-4 transition hover:text-ink"
            >
              See all
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Nothing yet. Scan a code or enter a UPI ID to make your first
            payment.
          </p>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {recent.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-[11px] leading-relaxed text-ink-faint">
        Paisa keeps your payment history on this device.
      </p>
    </div>
  )
}
