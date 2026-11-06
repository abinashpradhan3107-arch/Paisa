import { ScanLine } from 'lucide-react'
import type { Transaction } from '../types'
import { formatMonthLabel } from '../utils/storage'
import { TransactionItem } from '../components/TransactionItem'

interface HistoryPageProps {
  transactions: Transaction[]
  onOpen: (transaction: Transaction) => void
  onScan: () => void
}

function groupByMonth(
  transactions: Transaction[],
): { label: string; items: Transaction[] }[] {
  const groups: { label: string; items: Transaction[] }[] = []
  for (const transaction of transactions) {
    const label = formatMonthLabel(transaction.timestamp)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.items.push(transaction)
    } else {
      groups.push({ label, items: [transaction] })
    }
  }
  return groups
}

/** Locally stored simulated payments, grouped by month. */
export function HistoryPage({ transactions, onOpen, onScan }: HistoryPageProps) {
  const groups = groupByMonth(transactions)

  return (
    <div className="animate-screen min-h-dvh px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <header>
        <h1 className="font-display text-[42px] leading-none tracking-[-0.01em] text-ink">
          History
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {transactions.length > 0
            ? `${transactions.length} simulated ${
                transactions.length === 1 ? 'payment' : 'payments'
              } on this device.`
            : 'Simulated payments on this device.'}
        </p>
      </header>

      {transactions.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center px-6 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-card-2 text-ink-soft">
            <ScanLine className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink">No payments yet</p>
          <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-ink-soft">
            Scan a UPI QR code to try the full simulated payment journey.
          </p>
          <button type="button" onClick={onScan} className="btn-primary mt-5 h-12 px-6">
            <ScanLine className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Scan a QR code
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="mt-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="label">{group.label}</h2>
              <span className="text-[11px] text-ink-faint">
                {group.items.length}
              </span>
            </div>
            <ul className="mt-1 divide-y divide-line/60">
              {group.items.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onOpen={onOpen}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="mt-8 flex justify-center">
        <span className="sim-pill">Simulation · no money transferred</span>
      </div>
    </div>
  )
}
