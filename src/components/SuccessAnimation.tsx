import { useEffect } from 'react'
import { Check } from 'lucide-react'
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
 * Curie Payment Success / Transaction Details Page
 * Restrained, high-craft fintech styling with neutral accents and clear simulation disclosures.
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
      {/* 1. App Header: Curie Wordmark Logo & Restrained Status Pill */}
      <header className="flex items-center justify-between pb-4 border-b border-line/60">
        <div className="flex items-center select-none">
          <span className="font-display text-[26px] leading-none tracking-[-0.01em] text-ink">
            curie
          </span>
        </div>
        <div className="rounded-full border border-line bg-card/60 px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
          Successful
        </div>
      </header>

      {/* 2. Transaction Success Header (Clean Horizontal Layout, Restrained Indicator) */}
      <div className="mt-5 flex items-center gap-3.5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#185c40] text-white border border-[#237553]/50">
          <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] sm:text-[19px] font-semibold tracking-tight text-ink">
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
        Curie · Local Prototype
      </p>
    </div>
  )
}
