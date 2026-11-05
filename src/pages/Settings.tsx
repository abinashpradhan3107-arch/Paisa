import { useState } from 'react'
import { Monitor, Moon, Sun, Trash2 } from 'lucide-react'
import type { ThemePreference } from '../types'

interface SettingsPageProps {
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
  soundEnabled: boolean
  onSoundChange: (enabled: boolean) => void
  transactionCount: number
  onClearHistory: () => void
}

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const ABOUT_ROWS = [
  ['Version', '1.0.0'],
  ['Platform', 'Web'],
  ['Storage', 'This device'],
  ['Network', 'None'],
]

/** Appearance, local data and app information. */
export function SettingsPage({
  theme,
  onThemeChange,
  soundEnabled,
  onSoundChange,
  transactionCount,
  onClearHistory,
}: SettingsPageProps) {
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="px-5 pb-28 pt-6 md:pb-10">
      <header>
        <p className="label">Settings</p>
        <h1 className="mt-1 font-display text-[40px] leading-none tracking-[-0.01em] text-ink">
          Preferences
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="label">Appearance</h2>
        <div
          className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-line p-1"
          role="radiogroup"
          aria-label="Theme"
        >
          {THEMES.map(({ value, label, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onThemeChange(value)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition ${
                  active
                    ? 'bg-ink text-paper'
                    : 'text-ink-soft hover:bg-paper-2'
                }`}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                {label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="label">Feedback</h2>
        <div className="mt-2 border-y border-line">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-sm text-ink-soft">Success sound</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">
                Plays when a payment completes
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Success sound"
              onClick={() => onSoundChange(!soundEnabled)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                soundEnabled ? 'bg-accent' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="label">Data</h2>
        <div className="mt-2 divide-y divide-line border-y border-line">
          <div className="flex items-center justify-between py-3.5 text-sm">
            <span className="text-ink-soft">Payments saved</span>
            <span className="font-semibold tabular-nums text-ink">
              {transactionCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={transactionCount === 0}
            className="flex w-full items-center justify-between py-3.5 text-left text-sm text-danger transition disabled:text-ink-faint"
          >
            Clear history
            <Trash2 className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        {confirmClear && (
          <div className="mt-3 rounded-xl border border-danger/30 bg-danger-soft p-4">
            <p className="text-sm font-medium text-danger">
              Delete all {transactionCount} payment
              {transactionCount === 1 ? '' : 's'}?
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              This cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="btn-quiet flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory()
                  setConfirmClear(false)
                }}
                className="flex-1 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-paper transition hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="label">About</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Paisa is a UPI checkout interface built for design and testing. It runs
          entirely in your browser and does not connect to a bank or payment
          network.
        </p>

        <dl className="mt-4 border-t border-line">
          {ABOUT_ROWS.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-line py-2.5 text-sm"
            >
              <dt className="text-ink-faint">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
