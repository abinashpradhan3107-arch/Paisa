import { ChevronRight } from 'lucide-react'
import type { Transaction } from '../types'
import { formatINR } from '../utils/upiParser'
import { formatDate, formatTime } from '../utils/storage'
import { initials } from '../utils/display'

interface TransactionItemProps {
  transaction: Transaction
  onOpen?: (transaction: Transaction) => void
}

/** A single simulated payment row in the history list. */
export function TransactionItem({ transaction, onOpen }: TransactionItemProps) {
  const body = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card-2 text-[11px] font-semibold tracking-wide text-accent">
        {initials(transaction.merchantName)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-ink">
          {transaction.merchantName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink-faint">
          {formatDate(transaction.timestamp)} · {formatTime(transaction.timestamp)}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Success
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <p className="text-[14px] font-semibold tabular-nums text-ink">
          {formatINR(transaction.amount)}
        </p>
        <ChevronRight
          className="h-3.5 w-3.5 text-ink-faint"
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </div>
    </>
  )

  return (
    <li>
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(transaction)}
          className="flex w-full min-w-0 items-center gap-3 py-3 text-left transition active:opacity-70"
          aria-label={`View receipt for ${transaction.merchantName}`}
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 items-center gap-3 py-3">{body}</div>
      )}
    </li>
  )
}
