import { useEffect } from 'react'
import type { Transaction } from '../types'
import { playSuccessSound } from '../utils/sound'
import { Receipt } from './Receipt'

interface SuccessAnimationProps {
  transaction: Transaction
  onNewPayment: () => void
  onViewHistory: () => void
  soundEnabled: boolean
}

/** Formats timestamp into date and time for header */
function formatHeaderDateTime(timestamp?: number, fallbackDate?: string): string {
  const d = timestamp ? new Date(timestamp) : new Date()
  const isValid = !isNaN(d.getTime())

  if (!isValid && fallbackDate) return fallbackDate

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

  return `${date}, ${time}`
}

/**
 * Redesigned Paisa Payment Success / Transaction Details Page
 * Compliant with PhonePe layout & information hierarchy while adhering to Paisa's dark fintech aesthetic.
 */
export function SuccessAnimation({
  transaction,
  onNewPayment,
  onViewHistory,
  soundEnabled,
}: SuccessAnimationProps) {
  // Play chime and trigger gentle vibration on completion
  useEffect(() => {
    if (soundEnabled) void playSuccessSound(0.7)
    if ('vibrate' in navigator) {
      navigator.vibrate([16, 30, 20])
    }
  }, [soundEnabled])

  const formattedDateTime = formatHeaderDateTime(
    transaction.timestamp,
    transaction.date,
  )

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-5 sm:px-6 sm:py-7 animate-fade-up">
      {/* 1. App Header: Paisa Wordmark Logo & Status Pill */}
      <header className="flex items-center justify-between pb-4 border-b border-line/60">
        <div className="flex items-center gap-1 select-none">
          <span className="font-display text-[26px] leading-none tracking-[-0.01em] text-ink">
            paisa
          </span>
          <span className="mb-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Paid</span>
        </div>
      </header>

      {/* 2. Transaction Success Header (Clean Horizontal Layout) */}
      <div className="mt-5 flex items-center gap-3.5">
        {/* Subtle, polished green success indicator */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-950/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-zinc-950"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-ink">
            Transaction Successful
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formattedDateTime}
          </p>
        </div>
      </div>

      {/* 3. Transaction Details Card Component */}
      <Receipt transaction={transaction} className="mt-5" defaultExpanded={true} />

      {/* 4. Action Buttons: Done & Activity */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onNewPayment}
          className="btn-primary flex-1 py-3.5 text-sm font-semibold"
        >
          Done
        </button>
        <button
          type="button"
          onClick={onViewHistory}
          className="btn-quiet flex-1 py-3.5 text-sm font-semibold"
        >
          Activity
        </button>
      </div>

      {/* 5. Footer Prototype Indicator */}
      <p className="mt-4 text-center text-[10px] text-ink-faint/60">
        Paisa · Local Prototype
      </p>
    </div>
  )
}
