import type { FundingSource, FundingSourceId } from '../types'

/** Starting simulated wallet balance. */
export const DEFAULT_BALANCE = 50_000

/** Maximum amount accepted by the keypad and the UPI parser. */
export const MAX_AMOUNT = 100_000

/** The two simulated accounts a payment can come from. */
export const FUNDING_SOURCES: Record<FundingSourceId, FundingSource> = {
  wallet: {
    id: 'wallet',
    name: 'Curie Wallet',
    description: 'Simulated balance',
    accountType: 'Wallet',
    maskedAccount: '•••• 2048',
    upiId: 'wallet@curie',
    bankName: 'Curie Wallet',
  },
  bank: {
    id: 'bank',
    name: 'Simulated bank account',
    description: 'Savings •••• 4821',
    accountType: 'Savings',
    maskedAccount: '•••• 4821',
    upiId: 'user@curie',
    bankName: 'Simulated Bank',
  },
}

/** Returns a funding source, falling back to the simulated bank account. */
export function getFundingSource(id: FundingSourceId): FundingSource {
  return FUNDING_SOURCES[id] ?? FUNDING_SOURCES.bank
}
