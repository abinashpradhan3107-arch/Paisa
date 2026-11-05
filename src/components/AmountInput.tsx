import { useState } from 'react'
import { Delete } from 'lucide-react'
import { formatRupees } from '../utils/upiParser'

const MAX_AMOUNT = 100_000
const QUICK_AMOUNTS = [100, 500, 1000]

interface AmountInputProps {
  /** Amount requested by the QR code, in rupees. */
  initialAmount?: number | null
  /** Called with the validated amount when the user continues. */
  onContinue: (amount: number) => void
  disabled?: boolean
}

/** Keeps only digits and a single decimal separator (max 2 decimals). */
function sanitizeAmount(raw: string): string {
  let value = raw.replace(/[^\d.]/g, '')
  const firstDot = value.indexOf('.')
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, '')
  }
  const [integerPart = '', decimalPart] = value.split('.')
  const integer = integerPart.slice(0, 6)
  const next =
    decimalPart === undefined ? integer : `${integer}.${decimalPart.slice(0, 2)}`
  return Number(next) > MAX_AMOUNT ? String(MAX_AMOUNT) : next
}

/**
 * Amount entry with a large mobile keypad, decimal support and quick amounts.
 */
export function AmountInput({
  initialAmount,
  onContinue,
  disabled = false,
}: AmountInputProps) {
  const [value, setValue] = useState(() =>
    initialAmount && initialAmount > 0 ? String(initialAmount) : '',
  )

  const amount = Number(value)
  const valid = Number.isFinite(amount) && amount > 0

  const append = (char: string) => {
    if (disabled) return
    setValue((current) => {
      if (char === '.') {
        if (current.includes('.')) return current
        return current === '' ? '0.' : `${current}.`
      }
      if (current === '0') return char
      return sanitizeAmount(`${current}${char}`)
    })
  }

  const backspace = () => {
    if (disabled) return
    setValue((current) => current.slice(0, -1))
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']

  return (
    <div>
      <div className="mt-7 text-center">
        <label htmlFor="payment-amount" className="label">
          Amount
        </label>
        <div className="mt-1 flex items-baseline justify-center">
          <span className="font-display text-3xl text-ink-faint">₹</span>
          <input
            id="payment-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={value}
            disabled={disabled}
            onChange={(event) => setValue(sanitizeAmount(event.target.value))}
            className="w-full max-w-[9ch] bg-transparent text-center font-display text-6xl leading-none tabular-nums text-ink outline-none placeholder:text-ink-faint/50 disabled:opacity-60"
            aria-describedby="amount-help"
          />
        </div>
        <p id="amount-help" className="mt-2 min-h-4 text-xs text-ink-faint">
          {initialAmount && initialAmount > 0
            ? 'From the QR code. Tap to edit.'
            : `Up to ${formatRupees(MAX_AMOUNT)}`}
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {QUICK_AMOUNTS.map((quick) => {
          const active = Number(value) === quick
          return (
            <button
              key={quick}
              type="button"
              onClick={() => setValue(String(quick))}
              disabled={disabled}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                active
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-ink-faint'
              } disabled:opacity-40`}
            >
              {formatRupees(quick)}
            </button>
          )
        })}
      </div>

      <div
        className="mt-6 grid grid-cols-3 gap-x-2 gap-y-1"
        role="group"
        aria-label="Numeric keypad"
      >
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => append(key)}
            disabled={disabled}
            className="rounded-xl py-4 text-2xl font-medium tabular-nums text-ink transition hover:bg-paper-2 active:bg-paper-2 disabled:opacity-40"
            aria-label={key === '.' ? 'Decimal point' : key}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={backspace}
          disabled={disabled}
          className="grid place-items-center rounded-xl py-4 text-ink-soft transition hover:bg-paper-2 active:bg-paper-2 disabled:opacity-40"
          aria-label="Delete last digit"
        >
          <Delete className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {!valid && value !== '' && (
        <p className="mt-1 animate-shake text-center text-xs font-medium text-danger">
          Enter an amount greater than zero.
        </p>
      )}

      <div className="sticky bottom-0 mt-5 border-t border-line bg-paper pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          onClick={() => valid && onContinue(Math.round(amount * 100) / 100)}
          disabled={!valid || disabled}
          className="btn-primary w-full"
        >
          Pay {valid ? formatRupees(amount) : '—'}
        </button>
      </div>
    </div>
  )
}
