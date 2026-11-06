import { Delete } from 'lucide-react'
import { appendAmount, backspaceAmount } from '../utils/amount'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'] as const

interface AmountKeypadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/** Professional mobile keypad with decimal support and tactile feedback. */
export function AmountKeypad({
  value,
  onChange,
  disabled = false,
}: AmountKeypadProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="Numeric keypad"
    >
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(appendAmount(value, key))}
          disabled={disabled}
          className="h-14 rounded-2xl text-[22px] font-medium tabular-nums text-ink transition duration-100 hover:bg-card active:scale-[0.97] active:bg-card-2 disabled:opacity-40 sm:h-16"
          aria-label={key === '.' ? 'Decimal point' : key}
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(backspaceAmount(value))}
        disabled={disabled}
        className="grid h-14 place-items-center rounded-2xl text-ink-soft transition duration-100 hover:bg-card active:scale-[0.97] active:bg-card-2 disabled:opacity-40 sm:h-16"
        aria-label="Delete last digit"
      >
        <Delete className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
      </button>
    </div>
  )
}
