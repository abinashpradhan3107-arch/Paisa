import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import type { Transaction } from '../types'
import { formatDate, formatTime } from '../utils/storage'
import { formatINR } from '../utils/upiParser'
import { playSuccessSound } from '../utils/sound'
import { shareTransaction } from '../utils/share'

interface SuccessScreenProps {
  transaction: Transaction
  soundEnabled: boolean
  onViewDetails: () => void
  onDone: () => void
}

/** Premium completion screen with a drawn check and the simulated receipt. */
export function SuccessScreen({
  transaction,
  soundEnabled,
  onViewDetails,
  onDone,
}: SuccessScreenProps) {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (soundEnabled) void playSuccessSound(0.7)
    if ('vibrate' in navigator) {
      navigator.vibrate([16, 30, 20])
    }
  }, [soundEnabled])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleShare = async () => {
    const result = await shareTransaction(transaction)
    if (result === 'shared') setToast('Receipt shared')
    if (result === 'downloaded') setToast('Receipt image downloaded')
  }

  return (
    <div className="relative min-h-dvh px-5 pb-10 pt-5">
      <header className="flex items-center justify-between">
        <span className="font-display text-[28px] leading-none tracking-[-0.01em] text-ink">
          curie
        </span>
        <span className="rounded-full border border-line bg-card px-2.5 py-1 text-[10px] font-medium text-ink-soft">
          Simulated
        </span>
      </header>

      <div className="mt-9 text-center">
        <div className="relative mx-auto grid h-28 w-28 place-items-center">
          <span
            className="absolute inset-0 animate-halo rounded-full border border-accent/35"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 animate-halo rounded-full border border-accent/20 [animation-delay:220ms]"
            aria-hidden="true"
          />
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-accent text-on-accent">
            <svg
              viewBox="0 0 52 52"
              fill="none"
              stroke="currentColor"
              className="h-11 w-11"
              aria-hidden="true"
            >
              <path
                d="M15 27.5 22.5 35 37.5 19"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                strokeDashoffset="48"
                className="animate-check"
              />
            </svg>
          </span>
        </div>

        <p className="animate-rise mt-7 text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          Payment completed
        </p>
        <p className="animate-rise mt-2 font-display text-[54px] leading-none tabular-nums tracking-[-0.02em] text-ink">
          {formatINR(transaction.amount)}
        </p>
        <p className="animate-rise mt-2 text-sm text-ink-soft">
          to {transaction.merchantName}
        </p>
        <p className="animate-rise mt-1 text-xs text-ink-faint">
          {formatDate(transaction.timestamp)} ·{' '}
          {formatTime(transaction.timestamp)}
        </p>
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-card p-4">
        <div className="flex items-center justify-between gap-4 py-1.5">
          <span className="text-xs text-ink-faint">Reference</span>
          <span className="font-mono text-xs tracking-wide text-ink">
            {transaction.reference}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-line/70 py-1.5 pt-3">
          <span className="text-xs text-ink-faint">Payment mode</span>
          <span className="text-xs font-medium text-ink">UPI · Simulated</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-line/70 py-1.5 pt-3">
          <span className="text-xs text-ink-faint">Status</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Successful
          </span>
        </div>
      </section>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="btn-primary flex-1"
        >
          View details
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="btn-quiet h-14 w-14 shrink-0 px-0"
          aria-label="Share receipt"
        >
          <Share2 className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-3 h-11 w-full text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        Done
      </button>

      <div className="mt-8 flex justify-center">
        <span className="sim-pill">Simulation · no money transferred</span>
      </div>
      <p className="mt-3 text-center text-[10px] text-ink-faint">
        Curie · local payment simulator
      </p>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90%] animate-fade-up rounded-full border border-line bg-card-2 px-4 py-2 text-xs font-medium text-ink shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
