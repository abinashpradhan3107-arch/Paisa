import { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import type { Transaction } from '../types'
import { formatINR } from '../utils/upiParser'
import { formatMonthLabel } from '../utils/storage'
import { Receipt } from '../components/Receipt'
import { TransactionItem } from '../components/TransactionItem'

interface HistoryPageProps {
  transactions: Transaction[]
  onScan: () => void
  onRemove: (id: string) => void
  onClear: () => void
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

/** Full payment history, grouped by month. */
export function HistoryPage({
  transactions,
  onScan,
  onRemove,
  onClear,
}: HistoryPageProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    selectedId === null
      ? null
      : transactions.find((transaction) => transaction.id === selectedId) ?? null
  const total = transactions.reduce((sum, item) => sum + item.amount, 0)
  const groups = groupByMonth(transactions)

  return (
    <div className="px-5 pb-28 pt-6 md:pb-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="label">Activity</p>
          <h1 className="mt-1 font-display text-[40px] leading-none tracking-[-0.01em] text-ink">
            History
          </h1>
        </div>
        {transactions.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="pb-1 text-xs text-ink-soft underline decoration-line underline-offset-4 transition hover:text-danger"
          >
            Clear
          </button>
        )}
      </header>

      <p className="mt-3 text-sm text-ink-soft">
        {transactions.length === 0
          ? 'No payments yet.'
          : `${transactions.length} payment${
              transactions.length === 1 ? '' : 's'
            } · ${formatINR(total)}`}
      </p>

      {transactions.length === 0 ? (
        <div className="mt-10 border-t border-line pt-8">
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Payments you make will show up here, on this device.
          </p>
          <button
            type="button"
            onClick={onScan}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink"
          >
            Scan a QR code
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="label">{group.label}</h2>
              <ul className="mt-1 divide-y divide-line">
                {group.items.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onRemove={onRemove}
                    onOpen={setSelectedId}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-[520px] animate-sheet overflow-y-auto rounded-t-2xl bg-paper px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto h-1 w-9 rounded-full bg-line" />

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label">Payment successful</p>
                <h2
                  id="receipt-title"
                  className="mt-1 font-display text-[36px] leading-none tabular-nums text-ink"
                >
                  {formatINR(selected.amount)}
                </h2>
                <p className="mt-2 truncate text-sm text-ink-soft">
                  Paid to {selected.merchantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-paper-2 hover:text-ink"
                aria-label="Close receipt"
              >
                <X className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>

            <Receipt transaction={selected} className="mt-5" />

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="btn-primary mt-5 w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-history-title"
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="w-full max-w-[520px] animate-sheet rounded-t-2xl bg-paper px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto h-1 w-9 rounded-full bg-line" />
            <h2
              id="clear-history-title"
              className="mt-4 font-display text-2xl text-ink"
            >
              Clear history?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              This removes all {transactions.length} payment
              {transactions.length === 1 ? '' : 's'} from this device. It cannot
              be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="btn-quiet flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setConfirmClear(false)
                }}
                className="flex-1 rounded-xl bg-danger px-5 py-3.5 text-sm font-semibold text-paper transition hover:opacity-90"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
