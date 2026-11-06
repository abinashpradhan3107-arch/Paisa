/**
 * Shared type definitions for the Curie UPI payment simulator.
 */

/** Top-level navigation destinations. */
export type Page = 'home' | 'history' | 'scan' | 'profile'

/** Steps inside the payment flow. */
export type PaymentStep = 'recipient' | 'processing' | 'success'

/** Simulated funding sources available on the recipient screen. */
export type FundingSourceId = 'wallet' | 'bank'

/** A simulated account the payment can be funded from. */
export interface FundingSource {
  id: FundingSourceId
  /** Display name, e.g. "Curie Wallet". */
  name: string
  /** Short supporting line, e.g. "Simulated balance". */
  description: string
  /** Account type shown on the receipt. */
  accountType: string
  /** Masked simulated account number. */
  maskedAccount: string
  /** Simulated sender VPA. */
  upiId: string
  /** Simulated institution name. */
  bankName: string
}

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
  note?: string
  fundingSource: FundingSourceId
}

/** A locally stored simulated payment record. */
export interface Transaction {
  /** Unique id. */
  id: string
  /** 12-digit simulated reference number shown on the receipt. */
  reference: string
  /** 14-character alphanumeric simulated transaction id. */
  transactionId: string
  /** 10-digit simulated reference retrieval number. */
  rrn: string
  merchantName: string
  payeeUpiId: string
  /** Amount in rupees. */
  amount: number
  currency: string
  /** Pre-formatted local date/time. */
  date: string
  /** Unix timestamp in milliseconds. */
  timestamp: number
  /** Optional note added by the payer. */
  note?: string
  /** Which simulated source funded the payment. */
  fundingSource: FundingSourceId
  /** Simulated sender name shown in the "Debited from" block. */
  senderName: string
  /** Simulated sender UPI ID. */
  senderUpiId: string
  /** Simulated institution name. */
  senderBank: string
  /** Account type, e.g. "Wallet" or "Savings". */
  senderAccountType: string
  /** Masked simulated sender account, e.g. "•••• 4821". */
  senderAccount: string
}

/** Reasons the QR scanner can fail. */
export type QrScanErrorType =
  | 'permission-denied'
  | 'camera-unavailable'
  | 'invalid-qr'
  | 'scanner-error'
