import type { UpiPayload } from '../types'

/** UPI VPAs look like `name@handle`. Handles are alphabetic; names are permissive. */
const VPA_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/

/**
 * Returns true when `value` looks like a valid UPI VPA.
 */
export function isValidUpiId(value: string): boolean {
  return VPA_PATTERN.test(value.trim())
}

/**
 * Parses a UPI QR payload into structured data.
 *
 * Supported format (case-insensitive scheme/host):
 * `upi://pay?pa=merchant@upi&pn=Merchant%20Name&am=100.50&cu=INR&tn=Note`
 *
 * Note: in the UPI spec `am` is expressed in **rupees**, not paise.
 *
 * @throws Error with a user-friendly message when the payload is not a valid UPI URI.
 */
export function parseUpiPayload(payload: string): UpiPayload {
  const raw = payload?.trim()
  if (!raw) {
    throw new Error('The QR code is empty.')
  }

  const schemeMatch = /^upi:\/\/([^/?#]*)(?:\/[^?#]*)?\?(.*)$/i.exec(raw)
  if (!schemeMatch) {
    throw new Error('This is not a UPI QR code.')
  }

  const host = schemeMatch[1].toLowerCase()
  if (host && host !== 'pay') {
    throw new Error(`Unsupported UPI action "${schemeMatch[1]}".`)
  }

  const params = new URLSearchParams(schemeMatch[2])

  const payeeUpiId = (params.get('pa') ?? '').trim()
  if (!payeeUpiId) {
    throw new Error('The QR code is missing a payee UPI ID.')
  }
  if (!isValidUpiId(payeeUpiId)) {
    throw new Error('The QR code contains an invalid UPI ID.')
  }

  const merchantName = (params.get('pn') ?? '').trim() || payeeUpiId

  const amountParam = params.get('am')
  let amount: number | null = null
  if (amountParam !== null && amountParam.trim() !== '') {
    const parsed = Number(amountParam)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error('The QR code contains an invalid amount.')
    }
    if (parsed > 100_000) {
      throw new Error('The QR code amount exceeds the ₹1,00,000 limit.')
    }
    amount = Math.round(parsed * 100) / 100
  }

  const currency = (params.get('cu') ?? 'INR').trim().toUpperCase() || 'INR'
  if (currency !== 'INR') {
    throw new Error(`Unsupported currency "${currency}". Only INR is supported.`)
  }

  const note = (params.get('tn') ?? '').trim() || undefined

  return {
    payeeUpiId,
    merchantName,
    amount,
    currency,
    note,
    rawPayload: raw,
  }
}

/**
 * Builds a payload for a manually entered UPI ID.
 */
export function buildManualPayload(upiId: string): UpiPayload {
  const payeeUpiId = upiId.trim()
  if (!isValidUpiId(payeeUpiId)) {
    throw new Error('Enter a valid UPI ID, for example merchant@upi.')
  }
  const handle = payeeUpiId.split('@')[0]
  return {
    payeeUpiId,
    merchantName: handle.replace(/[._-]+/g, ' ').trim() || payeeUpiId,
    amount: null,
    currency: 'INR',
    rawPayload: `upi://pay?pa=${encodeURIComponent(payeeUpiId)}`,
  }
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats an amount in rupees using Indian digit grouping, e.g. `₹1,250.00`.
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0.00'
  return inrFormatter.format(amount)
}

/**
 * Formats an amount without forced decimals, e.g. `₹1,250` for the keypad display.
 */
export function formatRupees(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(amount)}`
}

/**
 * Derives a friendly display name from a VPA (`swiggy@ybl` → `Swiggy`).
 */
export function merchantNameFromUpiId(upiId: string): string {
  const handle = upiId.split('@')[0] ?? upiId
  return (
    handle
      .replace(/[._-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase()) || upiId
  )
}
