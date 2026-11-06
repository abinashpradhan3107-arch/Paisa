import { formatAmountInput } from '../utils/amount'

interface AmountDisplayProps {
  value: string
  size?: 'md' | 'lg'
}

/** The large rupee readout shared by the home and payment screens. */
export function AmountDisplay({ value, size = 'lg' }: AmountDisplayProps) {
  const display = formatAmountInput(value)

  return (
    <div
      className="flex items-baseline justify-center gap-1.5"
      aria-live="polite"
      aria-label={`Amount ${display} rupees`}
    >
      <span
        className={`font-display text-ink-faint ${
          size === 'lg' ? 'text-[30px]' : 'text-[24px]'
        }`}
      >
        ₹
      </span>
      <span
        className={`font-display tabular-nums leading-none tracking-[-0.02em] ${
          size === 'lg' ? 'text-[64px]' : 'text-[46px]'
        } ${value ? 'text-ink' : 'text-ink-faint/35'}`}
      >
        {display}
      </span>
    </div>
  )
}
