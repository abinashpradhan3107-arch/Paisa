import { getFundingSource } from '../utils/funding'
import type { FundingSourceId } from '../types'
import { formatINR } from '../utils/upiParser'

interface ProcessingAnimationProps {
  merchantName: string
  amount: number
  fundingSource: FundingSourceId
}

/**
 * Full-screen pending state. The timer that advances the flow lives in `App`,
 * so this component never navigates on its own.
 */
export function ProcessingAnimation({
  merchantName,
  amount,
  fundingSource,
}: ProcessingAnimationProps) {
  const source = getFundingSource(fundingSource)

  return (
    <div
      className="grid min-h-dvh place-items-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xs text-center">
        <div className="relative mx-auto h-24 w-24">
          <span
            className="absolute inset-0 rounded-full border border-line"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-accent"
            aria-hidden="true"
          />
          <span
            className="absolute inset-3 animate-pulse-soft rounded-full bg-accent/10"
            aria-hidden="true"
          />
          <span className="absolute inset-4 grid place-items-center rounded-full bg-card">
            <span className="font-display text-3xl leading-none text-accent">
              c
            </span>
          </span>
        </div>

        <p className="mt-8 text-sm font-semibold text-ink">
          Processing payment…
        </p>
        <p className="mt-3 font-display text-[42px] leading-none tabular-nums text-ink">
          {formatINR(amount)}
        </p>
        <p className="mt-2 text-sm text-ink-soft">to {merchantName}</p>
        <p className="mt-1 text-xs text-ink-faint">
          from {source.name}
        </p>

        <div className="mx-auto mt-8 h-1 w-44 overflow-hidden rounded-full bg-line">
          <span className="block h-full w-1/3 animate-progress rounded-full bg-accent" />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Simulation · no money transferred
        </p>
      </div>
    </div>
  )
}
