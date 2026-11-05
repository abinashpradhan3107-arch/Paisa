import { formatINR } from '../utils/upiParser'

interface ProcessingAnimationProps {
  merchantName: string
  amount: number
}

/**
 * Quiet processing screen. The timer that advances the flow lives in `App`, so
 * this component never navigates on its own.
 */
export function ProcessingAnimation({
  merchantName,
  amount,
}: ProcessingAnimationProps) {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-paper px-6"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xs text-center">
        <span
          className="mx-auto block h-7 w-7 animate-spin rounded-full border border-line border-t-accent"
          aria-hidden="true"
        />
        <p className="mt-7 label">Paying</p>
        <h1 className="mt-2 font-display text-2xl leading-tight text-ink">
          {merchantName}
        </h1>
        <p className="mt-5 font-display text-4xl tabular-nums text-ink">
          {formatINR(amount)}
        </p>
        <div className="mx-auto mt-8 h-px w-40 overflow-hidden bg-line">
          <span className="block h-full w-1/3 animate-progress bg-accent" />
        </div>
        <p className="mt-6 text-xs text-ink-faint">Keep this screen open.</p>
      </div>
    </div>
  )
}
