import { useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  Info,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import type { Transaction } from '../types'
import { formatINR } from '../utils/upiParser'

interface ReceiptProps {
  transaction: Transaction
  className?: string
  defaultExpanded?: boolean
}

/** Generates initials from a name (max 2 uppercase letters). */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'UP'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

/** Formats a phone-number based UPI ID with masking e.g. ******5654-2@ibl */
function formatMaskedUpi(upiId: string): string {
  if (!upiId) return ''
  const parts = upiId.split('@')
  if (parts.length !== 2) return upiId
  const [user, handle] = parts

  // If user starts with or contains digits (phone number VPA)
  if (/^\d/.test(user) || user.length >= 10) {
    const visibleLength = user.includes('-') ? 6 : 4
    const visibleEnd = user.slice(-visibleLength)
    return `******${visibleEnd}@${handle}`
  }

  return upiId
}

/** Formats timestamp into date and time */
function formatDateTime(timestamp?: number, fallbackDate?: string): {
  date: string
  time: string
  full: string
} {
  const d = timestamp ? new Date(timestamp) : new Date()
  const isValid = !isNaN(d.getTime())

  if (!isValid && fallbackDate) {
    return {
      date: fallbackDate,
      time: '',
      full: fallbackDate,
    }
  }

  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const time = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return {
    date,
    time,
    full: `${date}, ${time}`,
  }
}

/** Clipboard utility with fallback */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* Fallback below */
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
        <Check className="h-3.5 w-3.5 text-ink" strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
      )}
    </button>
  )
}

/**
 * Premium fintech transaction receipt card with:
 * - Paid to merchant info with avatar, masked UPI ID and amount
 * - Conditional Banking Name row
 * - Expandable Transfer Details with reference number, mode, date, time
 * - Redesigned Debited From section with Simulated Account & Savings
 * - Persistent SIMULATION disclosure
 */
export function Receipt({
  transaction,
  className = '',
  defaultExpanded = true,
}: ReceiptProps) {
  const [transferDetailsOpen, setTransferDetailsOpen] = useState(defaultExpanded)
  const maskedUpi = formatMaskedUpi(transaction.payeeUpiId)
  const dt = formatDateTime(transaction.timestamp, transaction.date)

  // Banking Name section is shown only if merchantName is a genuine name distinct from payee UPI ID
  const hasBankingName = Boolean(
    transaction.merchantName &&
      transaction.merchantName !== transaction.payeeUpiId &&
      !transaction.merchantName.includes('@'),
  )

  // Debited from institution resolution:
  // If not genuinely supplied by the user (or assigned a demo/real bank name), use "Simulated Account"
  const isFabricatedBank =
    !transaction.senderBank ||
    transaction.senderBank === 'Demo Bank' ||
    transaction.senderBank === 'State Bank of India' ||
    transaction.senderBank === 'HDFC Bank' ||
    transaction.senderBank === 'Axis Bank' ||
    transaction.senderBank === 'Slice'

  const institutionName = isFabricatedBank
    ? 'Simulated Account'
    : transaction.senderBank

  // Preserve existing account number digits
  const rawAccount = transaction.senderAccount || '•••• 4821'
  const cleanMaskedNumber =
    rawAccount.replace(/^Savings\s*[·•\-–—]*\s*/i, '').trim() || '•••• 4821'

  return (
    <div className={`space-y-3.5 text-left ${className}`}>
      {/* 1. Main Charcoal Card: Paid to + Banking Name + Transfer Details */}
      <section className="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-sm">
        {/* Paid to label */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Paid to
        </p>

        {/* Merchant Info Row */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 border border-line text-xs font-semibold text-ink-soft select-none">
              {initials(transaction.merchantName)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] sm:text-[16px] font-semibold leading-tight text-ink">
                {transaction.merchantName}
              </h2>
              <p className="mt-0.5 truncate font-mono text-[12px] text-ink-soft">
                {maskedUpi}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-sans text-[20px] sm:text-[22px] font-bold tracking-tight tabular-nums text-ink">
              {formatINR(transaction.amount)}
            </p>
          </div>
        </div>

        {/* Banking Name Row (Conditional: only shown when banking/display name exists) */}
        {hasBankingName && (
          <div className="mt-3.5 border-t border-line/60 pt-3 flex items-center justify-between gap-4 text-xs">
            <span className="text-ink-soft">Banking Name</span>
            <div className="flex min-w-0 items-center justify-end gap-1.5">
              <span className="truncate font-medium text-ink text-right">
                {transaction.merchantName}
              </span>
              <Info
                className="h-3.5 w-3.5 shrink-0 text-ink-faint"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* Transfer Details Expandable Header */}
        <div className="mt-3.5 border-t border-line/60 pt-3">
          <button
            type="button"
            onClick={() => setTransferDetailsOpen((prev) => !prev)}
            aria-expanded={transferDetailsOpen}
            className="flex w-full items-center justify-between rounded-lg py-1 text-left transition hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <ReceiptText
                className="h-4 w-4 text-ink-soft"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm font-medium text-ink">
                Transfer Details
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-ink-soft transition-transform duration-200 ${
                transferDetailsOpen ? 'rotate-180' : ''
              }`}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {/* Transfer Details Expandable Content */}
          {transferDetailsOpen && (
            <dl className="mt-3 divide-y divide-line/50 border-t border-line/50 text-xs">
              {/* Reference Number */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink-soft">Reference Number</dt>
                <dd className="flex min-w-0 items-center justify-end gap-1.5 font-mono text-[11px] sm:text-xs text-ink">
                  <span className="break-all text-right">
                    {transaction.reference}
                  </span>
                  <CopyButton
                    value={transaction.reference}
                    label="reference number"
                  />
                </dd>
              </div>

              {/* Payment Mode */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink-soft">Payment Mode</dt>
                <dd className="text-right font-medium text-ink">
                  UPI QR
                </dd>
              </div>

              {/* Payee UPI ID */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink-soft">Payee UPI ID</dt>
                <dd className="flex min-w-0 items-center justify-end gap-1.5 font-mono text-[11px] sm:text-xs text-ink">
                  <span className="break-all text-right">
                    {transaction.payeeUpiId}
                  </span>
                  <CopyButton
                    value={transaction.payeeUpiId}
                    label="payee UPI ID"
                  />
                </dd>
              </div>

              {/* Transaction Date */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink-soft">Transaction Date</dt>
                <dd className="text-right font-medium text-ink">{dt.date}</dd>
              </div>

              {/* Transaction Time */}
              {dt.time && (
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-ink-soft">Transaction Time</dt>
                  <dd className="text-right font-medium text-ink">{dt.time}</dd>
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink-soft">Amount</dt>
                <dd className="text-right font-semibold text-ink">
                  {formatINR(transaction.amount)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* 2. Debited From Section (Clean, consistent with merchant card) */}
      <section className="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          DEBITED FROM
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper-2 border border-line text-ink-soft select-none">
              <Wallet className="h-4 w-4 text-ink-soft" strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {institutionName}
              </p>
              <p className="truncate text-xs text-ink-soft">
                Savings · {cleanMaskedNumber}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-mono text-sm font-medium text-ink-soft">
              −{formatINR(transaction.amount)}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Persistent Simulation Disclosure (No green dots, restrained styling) */}
      <div className="pt-2 text-center">
        <div className="inline-flex items-center rounded-full border border-line bg-card/60 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-medium tracking-wide text-ink-faint">
          <span>SIMULATION · NO MONEY TRANSFERRED</span>
        </div>
      </div>
    </div>
  )
}
