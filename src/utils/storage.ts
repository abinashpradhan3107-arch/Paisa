import type { ThemePreference, Transaction } from '../types'

const HISTORY_KEY = 'curie.history.v1'
const LEGACY_HISTORY_KEY = 'paisa.history.v1'
const THEME_KEY = 'curie.theme.v1'
const LEGACY_THEME_KEY = 'paisa.theme.v1'
const SOUND_KEY = 'curie.sound.v1'
const LEGACY_SOUND_KEY = 'paisa.sound.v1'
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

/**
 * The simulated sender shown on receipts.
 */
export const SIMULATED_SENDER = {
  name: 'Account Holder',
  upiId: 'user@curie',
  bank: 'Simulated Account',
  account: '•••• 4821',
} as const

export const DEMO_SENDER = SIMULATED_SENDER

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
  | 'senderName'
  | 'senderUpiId'
  | 'senderBank'
  | 'senderAccount'
  | 'currency'
> &
  Partial<
    Pick<
      Transaction,
      | 'transactionId'
      | 'rrn'
      | 'senderName'
      | 'senderUpiId'
      | 'senderBank'
      | 'senderAccount'
      | 'currency'
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
    senderName: record.senderName ?? SIMULATED_SENDER.name,
    senderUpiId: record.senderUpiId ?? SIMULATED_SENDER.upiId,
    senderBank:
      record.senderBank && record.senderBank !== 'Demo Bank'
        ? record.senderBank
        : SIMULATED_SENDER.bank,
    senderAccount: record.senderAccount ?? SIMULATED_SENDER.account,
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
      (item, index, all) => all.findIndex((other) => other.id === item.id) === index,
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

/** Reads the saved theme preference. */
export function loadTheme(): ThemePreference {
  const saved =
    getStorage()?.getItem(THEME_KEY) ?? getStorage()?.getItem(LEGACY_THEME_KEY)
  return saved === 'light' || saved === 'dark' || saved === 'system'
    ? saved
    : 'system'
}

/** Persists the theme preference. */
export function saveTheme(theme: ThemePreference): void {
  getStorage()?.setItem(THEME_KEY, theme)
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

/** Generates a 12-digit UPI-style reference (the UTR on the receipt). */
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
  /** Defaults to now. */
  timestamp?: number
}

/**
 * Builds a complete, demo-safe payment record with the identifiers a real UPI
 * receipt shows: a 14-character transaction id, a 10-digit RRN and a UTR.
 */
export function createTransaction(input: CreateTransactionInput): Transaction {
  const timestamp = input.timestamp ?? Date.now()
  const reference = generateReference()
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `txn_${timestamp}_${Math.random().toString(36).slice(2, 10)}`

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
    senderName: SIMULATED_SENDER.name,
    senderUpiId: SIMULATED_SENDER.upiId,
    senderBank: SIMULATED_SENDER.bank,
    senderAccount: SIMULATED_SENDER.account,
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

/** Month label used to group history, e.g. "November 2026". */
export function formatMonthLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}
