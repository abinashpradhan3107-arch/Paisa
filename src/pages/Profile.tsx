import { useState } from 'react'
import { ChevronRight, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { DEFAULT_BALANCE } from '../utils/funding'
import { formatINR } from '../utils/upiParser'
import { Sheet } from '../components/Sheet'

interface ProfilePageProps {
  balance: number
  soundEnabled: boolean
  onSoundChange: (enabled: boolean) => void
  transactionCount: number
  onClearHistory: () => void
  onResetBalance: () => void
}

const ABOUT_ROWS: [string, string][] = [
  ['Version', '1.0.0'],
  ['Storage', 'This device'],
  ['Network', 'None'],
  ['Payments', 'Simulated'],
]

/** Account details, preferences and local data controls. */
export function ProfilePage({
  balance,
  soundEnabled,
  onSoundChange,
  transactionCount,
  onClearHistory,
  onResetBalance,
}: ProfilePageProps) {
  const [confirm, setConfirm] = useState<'clear' | 'reset' | null>(null)

  const handleConfirm = () => {
    if (confirm === 'clear') onClearHistory()
    if (confirm === 'reset') onResetBalance()
    setConfirm(null)
  }

  return (
    <div className="animate-screen min-h-dvh px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <header>
        <h1 className="font-display text-[42px] leading-none tracking-[-0.01em] text-ink">
          Profile
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          A local payment simulator. Nothing leaves this device.
        </p>
      </header>

      <section className="card mt-6 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-ink-soft">
            <UserRound className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">
              Account Holder
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">
              user@curie · Local simulator
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-line/70 pt-4">
          <div>
            <p className="label">Simulated wallet</p>
            <p className="mt-1 font-display text-[30px] leading-none tabular-nums text-ink">
              {formatINR(balance)}
            </p>
          </div>
          <span className="sim-pill">No real funds</span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="label">Preferences</h2>
        <div className="card mt-2 divide-y divide-line/60 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">Success sound</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">
                Play a chime after a simulated payment.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Success sound"
              onClick={() => onSoundChange(!soundEnabled)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition hover:bg-card-2"
            >
              <span
                className={`relative block h-6 w-11 rounded-full transition-colors duration-200 ${
                  soundEnabled ? 'bg-accent' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all duration-200 ${
                    soundEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setConfirm('reset')}
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition active:bg-card-2"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <RotateCcw className="h-4 w-4 text-ink-soft" strokeWidth={1.8} aria-hidden="true" />
              Reset simulated balance
            </span>
            <ChevronRight className="h-4 w-4 text-ink-faint" strokeWidth={1.7} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setConfirm('clear')}
            disabled={transactionCount === 0}
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition active:bg-card-2 disabled:opacity-40"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <Trash2 className="h-4 w-4 text-ink-soft" strokeWidth={1.8} aria-hidden="true" />
              Clear payment history
            </span>
            <span className="text-[11px] text-ink-faint">
              {transactionCount}
            </span>
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="label">About</h2>
        <dl className="card mt-2 divide-y divide-line/60 overflow-hidden px-4">
          {ABOUT_ROWS.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-3"
            >
              <dt className="text-xs text-ink-faint">{label}</dt>
              <dd className="text-xs font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm === 'clear'
            ? 'Clear payment history?'
            : 'Reset simulated balance?'
        }
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          {confirm === 'clear'
            ? `This removes all ${transactionCount} simulated ${
                transactionCount === 1 ? 'receipt' : 'receipts'
              } from this device. It cannot be undone.`
            : `The simulated wallet returns to ${formatINR(
                DEFAULT_BALANCE,
              )}. Existing receipts stay on this device.`}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirm(null)}
            className="btn-quiet flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={
              confirm === 'clear'
                ? 'inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-danger text-sm font-semibold text-[#2a0f0b] transition active:scale-[0.985]'
                : 'btn-primary flex-1'
            }
          >
            {confirm === 'clear' ? 'Clear history' : 'Reset balance'}
          </button>
        </div>
      </Sheet>
    </div>
  )
}
