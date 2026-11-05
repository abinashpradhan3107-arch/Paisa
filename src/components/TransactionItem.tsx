import { ChevronRight, X } from 'lucide-react'
import type { Transaction } from '../types'
import { formatINR } from '../utils/upiParser'
import { formatShortDate } from '../utils/storage'

interface TransactionItemProps {
  transaction: Transaction
  onRemove?: (id: string) => void
  onOpen?: (id: string) => void
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'UP'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

/** A single row in the payment history. */
export function TransactionItem({
  transaction,
  onRemove,
  onOpen,
}: TransactionItemProps) {
  const body = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-2 text-[11px] font-semibold text-ink-soft">
        {initials(transaction.merchantName)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">
          {transaction.merchantName}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-faint">
          {formatShortDate(transaction.timestamp)}
          <span className="text-accent"> · Success</span>
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-ink-faint">
          {transaction.transactionId}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <p className="text-[15px] font-semibold tabular-nums text-ink">
          −{formatINR(transaction.amount)}
        </p>
        {onOpen && (
          <ChevronRight
            className="h-3.5 w-3.5 text-ink-faint"
            strokeWidth={1.7}
            aria-hidden="true"
          />
        )}
      </div>
    </>
  )

  return (
    <li className="group flex items-center gap-1">
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(transaction.id)}
          className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition hover:opacity-75"
          aria-label={`View receipt for ${transaction.merchantName}`}
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 py-3">{body}</div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(transaction.id)}
          className="ml-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-danger-soft hover:text-danger md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          aria-label={`Remove payment to ${transaction.merchantName}`}
        >
          <X className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
        </button>
      )}
    </li>
  )
}
