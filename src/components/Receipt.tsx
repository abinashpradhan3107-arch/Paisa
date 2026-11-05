import { useRef, useState } from 'react'
import { Check, Copy, Info } from 'lucide-react'
import type { Transaction } from '../types'

interface ReceiptProps {
  transaction: Transaction
  className?: string
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'UP'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

/** Writes to the clipboard, falling back to a hidden textarea when needed. */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* Fall through to the legacy path. */
  }

  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(area)
    return copied
  } catch {
    return false
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  const handleCopy = async () => {
    const ok = await copyToClipboard(value)
    if (!ok) return
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint transition hover:bg-paper-2 hover:text-ink"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
      )}
    </button>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
  copyLabel,
  accent = false,
}: {
  label: string
  value: string
  mono?: boolean
  copyLabel?: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-1.5">
        {accent && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />
        )}
        <span
          className={`min-w-0 break-all text-right ${
            mono
              ? 'font-mono text-[12px] tracking-wide text-ink'
              : 'text-sm font-medium text-ink'
          } ${accent ? 'text-accent' : ''}`}
        >
          {value}
        </span>
        {copyLabel && <CopyButton value={value} label={copyLabel} />}
      </dd>
    </div>
  )
}

/**
 * The receipt body shared by the payment confirmation screen and the history
 * detail sheet. It mirrors the sections a real UPI app shows: who was paid,
 * which account paid, and the bank identifiers for the transfer.
 */
export function Receipt({ transaction, className = '' }: ReceiptProps) {
  return (
    <div className={`text-left ${className}`}>
      <section className="rounded-2xl border border-line bg-card px-4 py-4">
        <p className="label">Paid to</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent">
            {initials(transaction.merchantName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-ink">
              {transaction.merchantName}
            </p>
            <p className="truncate font-mono text-[11px] tracking-wide text-ink-faint">
              {transaction.payeeUpiId}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-card px-4 py-4">
        <p className="label">Paid from</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper-2 text-[12px] font-semibold text-ink-soft">
            {initials(transaction.senderName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-ink">
              {transaction.senderName}
            </p>
            <p className="truncate text-xs text-ink-soft">
              {transaction.senderBank} · {transaction.senderAccount}
            </p>
            <p className="truncate font-mono text-[11px] tracking-wide text-ink-faint">
              {transaction.senderUpiId}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <p className="label">Transaction details</p>
        <dl className="mt-1 divide-y divide-line border-y border-line">
          <DetailRow
            label="Transaction ID"
            value={transaction.transactionId}
            mono
            copyLabel="transaction ID"
          />
          <DetailRow
            label="RRN"
            value={transaction.rrn}
            mono
            copyLabel="RRN"
          />
          <DetailRow
            label="UTR"
            value={transaction.reference}
            mono
            copyLabel="UTR"
          />
          <DetailRow label="Date & time" value={transaction.date} />
          <DetailRow label="Status" value="Success" accent />
        </dl>
      </section>

      <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-faint">
        <Info className="mt-px h-3 w-3 shrink-0" strokeWidth={1.7} aria-hidden="true" />
        <span>
          {transaction.currency} · Demo payment. This is a simulated receipt and
          no money was transferred.
        </span>
      </p>
    </div>
  )
}
