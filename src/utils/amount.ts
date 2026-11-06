import { MAX_AMOUNT } from './funding'

/**
 * Keeps only digits and a single decimal separator (max 2 decimals) and caps
 * the value at the simulator limit. Returns a plain string suitable for the
 * keypad display.
 */
export function sanitizeAmount(raw: string): string {
  let value = raw.replace(/[^\d.]/g, '')

  const firstDot = value.indexOf('.')
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, '')
  }

  const [integerPart = '', decimalPart] = value.split('.')
  const integer = integerPart.replace(/^0+(?=\d)/, '').slice(0, 6)
  const next =
    decimalPart === undefined ? integer : `${integer}.${decimalPart.slice(0, 2)}`

  if (next === '') return ''
  if (next === '.') return '0.'
  return Number(next) > MAX_AMOUNT ? String(MAX_AMOUNT) : next
}

/** Handles one keypad press on the current value. */
export function appendAmount(current: string, key: string): string {
  if (key === '.') {
    if (current.includes('.')) return current
    return current === '' ? '0.' : `${current}.`
  }

  if (current === '0') return key
  return sanitizeAmount(`${current}${key}`)
}

/** Removes the last character from the amount. */
export function backspaceAmount(current: string): string {
  return current.slice(0, -1)
}

/** Parses the keypad string into a rupee amount, or `null` when invalid. */
export function parseAmount(value: string): number | null {
  if (!value.trim()) return null
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return Math.round(amount * 100) / 100
}

/** Formats the in-progress keypad value with Indian digit grouping. */
export function formatAmountInput(value: string): string {
  if (!value) return '0'
  const [integerPart, decimalPart] = value.split('.')
  const grouped = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(integerPart || 0))
  return decimalPart === undefined ? grouped : `${grouped}.${decimalPart}`
}
