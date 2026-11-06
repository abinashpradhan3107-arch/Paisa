import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Copy,
  Download,
  Share2,
  Trash2,
  Wallet,
} from 'lucide-react'
import type { Transaction } from '../types'
import { getFundingSource } from '../utils/funding'
import { formatDate, formatTime } from '../utils/storage'
import { formatINR } from '../utils/upiParser'
import { copyToClipboard } from '../utils/clipboard'
import { downloadReceipt, shareTransaction } from '../utils/share'
import { initials } from '../utils/display'
import { Sheet } from './Sheet'

interface TransactionDetailsProps {
  transaction: Transaction
  onBack: () => void
  onDeleted: (id: string) => void
}

interface DetailRowProps {
  label: string
  value: string
  mono?: boolean
}

function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd
        className={`min-w-0 break-words text-right text-xs font-medium text-ink ${
          mono ? 'font-mono tracking-wide' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

/**
 * Full receipt for one simulated payment. Every value is read from the stored
 * transaction object; nothing here contacts a bank or a UPI service.
 */
export function TransactionDetails({
  transaction,
  onBack,
  onDeleted,
}: TransactionDetailsProps) {
  const [expanded, setExpanded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const source = getFundingSource(transaction.fundingSource)
  const SourceIcon = transaction.fundingSource === 'wallet' ? Wallet : Building2

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleCopy = async () => {
    const copied = await copyToClipboard(transaction.reference)
    setToast(copied ? 'Reference copied' : 'Could not copy reference')
  }

  const handleShare = async () => {
    const result = await shareTransaction(transaction)
    if (result === 'shared') setToast('Receipt shared')
    if (result === 'downloaded') setToast('Receipt image downloaded')
  }

  const handleDownload = () => {
    downloadReceipt(transaction)
    setToast('Receipt image downloaded')
  }

  return (
    <div className="animate-screen min-h-dvh px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-card hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="text-xs font-medium text-ink-soft">Receipt</span>
        <button
          type="button"
          onClick={handleShare}
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-card hover:text-ink"
          aria-label="Share receipt"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </header>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-display text-[30px] leading-none tracking-[-0.01em] text-ink">
          curie
        </span>
        <span className="sim-pill">Simulation</span>
      </div>

      <div className="mt-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-[11px] font-semibold text-success">
          <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
          Payment completed
        </span>
        <p className="mt-3 text-xs text-ink-faint">
          {formatDate(transaction.timestamp)} · {formatTime(transaction.timestamp)}
        </p>
        <p className="mt-2 font-display text-[46px] leading-none tabular-nums tracking-[-0.02em] text-ink">
          {formatINR(transaction.amount)}
        </p>
      </div>

      <section className="card mt-6 p-4">
        <p className="label">Paid to</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card-2 text-sm font-semibold text-accent">
            {initials(transaction.merchantName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">
              {transaction.merchantName}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">
              {transaction.payeeUpiId}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-line/70 pt-3">
          <span className="text-xs text-ink-faint">Amount</span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {formatINR(transaction.amount)}
          </span>
        </div>
        {transaction.note && (
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Note · </span>
            {transaction.note}
          </p>
        )}
      </section>

      <section className="card mt-3 p-4">
        <p className="label">Debited from</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card-2 text-ink-soft">
            <SourceIcon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">
              {transaction.senderName}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">
              {source.name} · {transaction.senderAccountType} ·{' '}
              {transaction.senderAccount}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-line/70 pt-3">
          <span className="text-xs text-ink-faint">Debited amount</span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {formatINR(transaction.amount)}
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
          Simulated account. No real money moved.
        </p>
      </section>

      <section className="card mt-3 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="transfer-details"
          className="flex w-full items-center justify-between gap-4 p-4 text-left"
        >
          <span className="label">Transfer details</span>
          <ChevronDown
            className={`h-4 w-4 text-ink-faint transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>

        {expanded && (
          <div
            id="transfer-details"
            className="animate-fade-up border-t border-line/70 px-4 pb-4"
          >
            <dl className="divide-y divide-line/60">
              <DetailRow
                label="Reference number"
                value={transaction.reference}
                mono
              />
              <DetailRow label="Payment mode" value="UPI · Simulated" />
              <DetailRow label="Payee UPI ID" value={transaction.payeeUpiId} />
              <DetailRow
                label="Transaction date"
                value={formatDate(transaction.timestamp)}
              />
              <DetailRow
                label="Transaction time"
                value={formatTime(transaction.timestamp)}
              />
              <DetailRow label="Amount" value={formatINR(transaction.amount)} />
              <DetailRow
                label="Transaction ID"
                value={transaction.transactionId}
                mono
              />
              <DetailRow label="RRN" value={transaction.rrn} mono />
            </dl>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-ghost mt-2 text-xs"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
              Copy reference
            </button>
          </div>
        )}
      </section>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={handleShare} className="btn-primary flex-1">
          <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Share receipt
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="btn-quiet h-14 w-14 shrink-0 px-0"
          aria-label="Download receipt image"
        >
          <Download className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-ink-faint transition hover:text-danger"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        Delete this record
      </button>

      <div className="mt-6 flex justify-center">
        <span className="sim-pill">Simulation · no money transferred</span>
      </div>
      <p className="mt-3 text-center text-[10px] text-ink-faint">
        Generated locally by Curie. Not a bank receipt.
      </p>

      {toast && (
        <div
          role="status"
          className="animate-fade-up fixed inset-x-0 bottom-6 z-[60] mx-auto w-fit max-w-[90%] rounded-full border border-line bg-card-2 px-4 py-2 text-xs font-medium text-ink shadow-lg"
        >
          {toast}
        </div>
      )}

      <Sheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this record?"
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          This removes the simulated receipt from this device. It cannot be
          undone.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="btn-quiet flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false)
              onDeleted(transaction.id)
            }}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-danger text-sm font-semibold text-[#2a0f0b] transition active:scale-[0.985]"
          >
            Delete
          </button>
        </div>
      </Sheet>
    </div>
  )
}
