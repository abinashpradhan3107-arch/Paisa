import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { Transaction } from '../types'
import { formatINR } from '../utils/upiParser'
import { playSuccessSound } from '../utils/sound'
import { Receipt } from './Receipt'

const HOLD_MS = 2300
const EXIT_MS = 420

type Phase = 'enter' | 'leave' | 'done'

interface SuccessAnimationProps {
  transaction: Transaction
  onNewPayment: () => void
  onViewHistory: () => void
  soundEnabled: boolean
}

/** Confirmation screen: a green success wipe, then the payment receipt. */
export function SuccessAnimation({
  transaction,
  onNewPayment,
  onViewHistory,
  soundEnabled,
}: SuccessAnimationProps) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [reduceMotion] = useState(
    () =>
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  /* Play the chime and keep the success panel up long enough to read. */
  useEffect(() => {
    if (soundEnabled) void playSuccessSound(0.7)

    if ('vibrate' in navigator) {
      navigator.vibrate([16, 30, 20])
    }

    const hold = window.setTimeout(
      () => setPhase('leave'),
      reduceMotion ? 900 : HOLD_MS,
    )
    return () => window.clearTimeout(hold)
  }, [soundEnabled, reduceMotion])

  /* Let the panel finish sliding away before unmounting it. */
  useEffect(() => {
    if (phase !== 'leave') return
    const timer = window.setTimeout(
      () => setPhase('done'),
      reduceMotion ? 20 : EXIT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [phase, reduceMotion])

  /* Lock the page while the full-screen success panel is visible. */
  useEffect(() => {
    if (phase === 'done') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [phase])

  const skip = () => {
    if (phase === 'enter') setPhase('leave')
  }

  return (
    <div className="relative">
      <div
        className="animate-fade-up px-5 pb-12 pt-12"
        aria-hidden={phase === 'done' ? undefined : true}
      >
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-on-accent">
            <Check className="h-6 w-6" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <p className="mt-5 label">Payment complete</p>
          <h1 className="mt-1 font-display text-[44px] leading-none tabular-nums text-ink">
            {formatINR(transaction.amount)}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Paid to {transaction.merchantName}
          </p>
        </div>

        <Receipt transaction={transaction} className="mt-8" />

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onNewPayment}
            className="btn-primary flex-1"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="btn-quiet flex-1"
          >
            Activity
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-faint">
          Paisa · local prototype
        </p>
      </div>

      {phase !== 'done' && (
        <div
          className="fixed inset-0 z-50 bg-paper"
          role="status"
          aria-live="assertive"
          aria-label="Payment successful"
        >
          <div
            onClick={skip}
            className={`relative mx-auto flex h-full w-full max-w-[520px] cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0e722e] px-8 text-center text-white ${
              phase === 'leave' ? 'animate-wipe-up' : 'animate-wipe-down'
            }`}
          >
            <div className="relative">
              <div className="relative mx-auto grid h-24 w-24 place-items-center">
                <span
                  className="absolute inset-0 animate-halo rounded-full border border-white/50"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 animate-halo rounded-full border border-white/30 [animation-delay:180ms]"
                  aria-hidden="true"
                />
                <svg
                  viewBox="0 0 52 52"
                  fill="none"
                  stroke="currentColor"
                  className="animate-rise relative h-16 w-16"
                  aria-hidden="true"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="24"
                    strokeOpacity="0.28"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15 27.5 22.5 35 37.5 19"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="40"
                    strokeDashoffset="40"
                    className="animate-check"
                  />
                </svg>
              </div>

              <p className="animate-rise mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
                Payment successful
              </p>
              <p className="animate-rise mt-3 font-display text-5xl leading-none tabular-nums">
                {formatINR(transaction.amount)}
              </p>
              <p className="animate-rise mt-3 text-sm text-white/75">
                Paid to {transaction.merchantName}
              </p>
              <p className="animate-rise mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Demo · No real money
              </p>
            </div>

            <p className="absolute bottom-8 left-0 right-0 animate-rise text-[11px] text-white/45">
              Tap to continue
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
