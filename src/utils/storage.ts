import type { ThemePreference, Transaction } from '../types'

const HISTORY_KEY = 'paisa.history.v1'
const THEME_KEY = 'paisa.theme.v1'
const SOUND_KEY = 'paisa.sound.v1'
const HISTORY_LIMIT = 200

function getStorage(): Storage | null {
  try {
    const probe = '__paisa_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

function isTransaction(value: unknown): value is Transaction {
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

/** Returns all stored payments, newest first. */
export function loadTransactions(): Transaction[] {
  const storage = getStorage()
  if (!storage) return []

  const stored = storage.getItem(HISTORY_KEY)
  if (!stored) return []

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isTransaction)
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
  const saved = getStorage()?.getItem(THEME_KEY)
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
  return getStorage()?.getItem(SOUND_KEY) !== 'off'
}

/** Persists the success-sound preference. */
export function saveSoundEnabled(enabled: boolean): void {
  getStorage()?.setItem(SOUND_KEY, enabled ? 'on' : 'off')
}

/** Generates a 12-digit UPI-style reference. */
export function generateReference(): string {
  const stamp = Date.now().toString().slice(-9)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `${stamp}${random}`
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
