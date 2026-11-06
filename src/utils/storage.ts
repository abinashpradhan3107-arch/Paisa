import type { FundingSourceId, Transaction } from '../types'
import { DEFAULT_BALANCE, getFundingSource, MAX_AMOUNT } from './funding'

const HISTORY_KEY = 'curie.history.v1'
const LEGACY_HISTORY_KEY = 'paisa.history.v1'
const SOUND_KEY = 'curie.sound.v1'
const LEGACY_SOUND_KEY = 'paisa.sound.v1'
const BALANCE_KEY = 'curie.balance.v1'
const HISTORY_LIMIT = 200

function getStorage(): Storage | null {
  try {
    const probe = '__curie_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TRANSACTION_ID_PATTERN = /^[A-Za-z0-9]{14}$/
const RRN_PATTERN = /^\d{10}$/

/** FNV-1a hash, used to derive stable ids for records saved before this change. */
function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Small deterministic PRNG so legacy records keep the same ids on every load. */
function seededRandom(seed: number): () => number {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0x100000000
  }
}

function randomTransactionId(random: () => number = Math.random): string {
  let id = 'T'
  for (let index = 0; index < 13; index += 1) {
    id += ALPHANUMERIC[Math.floor(random() * ALPHANUMERIC.length)]
  }
  return id
}

function randomRrn(random: () => number = Math.random): string {
  let rrn = ''
  for (let index = 0; index < 10; index += 1) {
    rrn += Math.floor(random() * 10)
  }
  return rrn
}

/** A stored record may predate the receipt fields, so they are all optional. */
type StoredTransaction = Omit<
  Transaction,
  | 'transactionId'
  | 'rrn'
  | 'currency'
  | 'fundingSource'
  | 'senderName'
  | 'senderUpiId'
  | 'senderBank'
  | 'senderAccountType'
  | 'senderAccount'
> &
  Partial<
    Pick<
      Transaction,
      | 'transactionId'
      | 'rrn'
      | 'currency'
      | 'fundingSource'
      | 'senderName'
      | 'senderUpiId'
      | 'senderBank'
      | 'senderAccountType'
      | 'senderAccount'
    >
  >

function isTransaction(value: unknown): value is StoredTransaction {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.reference === 'string' &&
    typeof record.merchantName === 'string' &&
    typeof record.payeeUpiId === 'string' &&
    typeof record.amount === 'number' &&
    typeof record.date === 'string' &&
    typeof record.timestamp === 'number'
  )
}

/** Fills in receipt fields that older saved payments did not store. */
function normalizeTransaction(record: StoredTransaction): Transaction {
  const seed = `${record.id}:${record.timestamp}`
  const next = seededRandom(hashString(seed))
  const fundingSource: FundingSourceId =
    record.fundingSource === 'wallet' ? 'wallet' : 'bank'
  const source = getFundingSource(fundingSource)

  return {
    ...record,
    currency: record.currency ?? 'INR',
    transactionId:
      record.transactionId && TRANSACTION_ID_PATTERN.test(record.transactionId)
        ? record.transactionId
        : randomTransactionId(next),
    rrn:
      record.rrn && RRN_PATTERN.test(record.rrn)
        ? record.rrn
        : randomRrn(seededRandom(hashString(`${seed}:rrn`))),
    fundingSource,
    senderName: record.senderName ?? 'Account Holder',
    senderUpiId: record.senderUpiId ?? source.upiId,
    senderBank: record.senderBank ?? source.bankName,
    senderAccountType: record.senderAccountType ?? source.accountType,
    senderAccount: record.senderAccount ?? source.maskedAccount,
  }
}

/** Returns all stored payments, newest first. */
export function loadTransactions(): Transaction[] {
  const storage = getStorage()
  if (!storage) return []

  const stored =
    storage.getItem(HISTORY_KEY) ?? storage.getItem(LEGACY_HISTORY_KEY)
  if (!stored) return []

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isTransaction)
      .map(normalizeTransaction)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

/** Persists a payment and returns the updated history. */
export function addTransaction(transaction: Transaction): Transaction[] {
  const updated = [transaction, ...loadTransactions()]
    .filter(
      (item, index, all) =>
        all.findIndex((other) => other.id === item.id) === index,
    )
    .slice(0, HISTORY_LIMIT)

  getStorage()?.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

/** Removes one payment and returns the updated history. */
export function removeTransaction(id: string): Transaction[] {
  const updated = loadTransactions().filter((item) => item.id !== id)
  getStorage()?.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

/** Clears the entire payment history. */
export function clearTransactions(): void {
  getStorage()?.removeItem(HISTORY_KEY)
}

/** Reads the simulated wallet balance. */
export function loadBalance(): number {
  const raw = getStorage()?.getItem(BALANCE_KEY)
  if (raw === null || raw === undefined) return DEFAULT_BALANCE
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) return DEFAULT_BALANCE
  return Math.min(value, MAX_AMOUNT)
}

/** Persists the simulated wallet balance. */
export function saveBalance(balance: number): void {
  const safe = Math.max(0, Math.min(balance, MAX_AMOUNT))
  getStorage()?.setItem(BALANCE_KEY, String(Math.round(safe * 100) / 100))
}

/** Reads the success-sound preference (on by default). */
export function loadSoundEnabled(): boolean {
  const saved =
    getStorage()?.getItem(SOUND_KEY) ?? getStorage()?.getItem(LEGACY_SOUND_KEY)
  return saved !== 'off'
}

/** Persists the success-sound preference. */
export function saveSoundEnabled(enabled: boolean): void {
  getStorage()?.setItem(SOUND_KEY, enabled ? 'on' : 'off')
}

/** Generates a 12-digit simulated reference number. */
export function generateReference(): string {
  const stamp = Date.now().toString().slice(-9)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `${stamp}${random}`
}

interface CreateTransactionInput {
  merchantName: string
  payeeUpiId: string
  amount: number
  fundingSource: FundingSourceId
  note?: string
  /** Defaults to now. */
  timestamp?: number
}

/**
 * Builds a complete, clearly simulated payment record. The identifiers are
 * local placeholders, not real bank references.
 */
export function createTransaction(input: CreateTransactionInput): Transaction {
  const timestamp = input.timestamp ?? Date.now()
  const reference = generateReference()
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `txn_${timestamp}_${Math.random().toString(36).slice(2, 10)}`
  const source = getFundingSource(input.fundingSource)

  return {
    id,
    reference,
    transactionId: randomTransactionId(),
    rrn: randomRrn(),
    merchantName: input.merchantName,
    payeeUpiId: input.payeeUpiId,
    amount: input.amount,
    currency: 'INR',
    date: formatTimestamp(timestamp),
    timestamp,
    note: input.note,
    fundingSource: input.fundingSource,
    senderName: 'Account Holder',
    senderUpiId: source.upiId,
    senderBank: source.bankName,
    senderAccountType: source.accountType,
    senderAccount: source.maskedAccount,
  }
}

/** Formats a timestamp for the receipt. */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Compact timestamp for list rows. */
export function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Full date for receipt rows. */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Time for receipt rows. */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Month label used to group history, e.g. "November 2026". */
export function formatMonthLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}
