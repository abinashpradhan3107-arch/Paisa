/**
 * Shared type definitions for the Paisa UPI checkout interface.
 */

/** Top-level navigation destinations. */
export type Page = 'home' | 'scan' | 'history' | 'settings'

/** Steps inside the payment flow. */
export type PaymentStep = 'details' | 'processing' | 'success'

/** Theme preference stored on the device. */
export type ThemePreference = 'light' | 'dark' | 'system'

/** A UPI payload parsed from a QR code or entered manually. */
export interface UpiPayload {
  /** Payee VPA, e.g. "merchant@upi". */
  payeeUpiId: string
  /** Merchant / payee display name. */
  merchantName: string
  /** Amount in rupees, or `null` when the QR code does not fix an amount. */
  amount: number | null
  /** ISO currency code (UPI only supports INR in practice). */
  currency: string
  /** Optional transaction note (`tn`). */
  note?: string
  /** Raw string that produced this payload. */
  rawPayload: string
}

/** Details being confirmed on the payment screen. */
export interface PaymentDetails {
  merchantName: string
  payeeUpiId: string
  amount: number
}

/** A locally stored payment record. */
export interface Transaction {
  /** Unique id, also used as the reference. */
  id: string
  /** 12-digit UPI-style reference. */
  reference: string
  merchantName: string
  payeeUpiId: string
  /** Amount in rupees. */
  amount: number
  currency: string
  /** Pre-formatted local date/time. */
  date: string
  /** Unix timestamp in milliseconds. */
  timestamp: number
}

/** Reasons the QR scanner can fail. */
export type QrScanErrorType =
  | 'permission-denied'
  | 'camera-unavailable'
  | 'invalid-qr'
  | 'scanner-error'
