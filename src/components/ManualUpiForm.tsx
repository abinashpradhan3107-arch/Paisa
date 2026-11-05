import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import type { UpiPayload } from '../types'
import { buildManualPayload } from '../utils/upiParser'

interface ManualUpiFormProps {
  onSubmit: (payload: UpiPayload) => void
  autoFocus?: boolean
}

/** Compact UPI ID entry used on the home and scanner screens. */
export function ManualUpiForm({ onSubmit, autoFocus = false }: ManualUpiFormProps) {
  const [upiId, setUpiId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const payload = buildManualPayload(upiId)
      setError(null)
      onSubmit(payload)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Enter a valid UPI ID.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2" noValidate>
      <div
        className={`flex items-center gap-2 border-b pb-2 transition ${
          error ? 'border-danger' : 'border-line focus-within:border-ink'
        }`}
      >
        <input
          id="manual-upi-id"
          type="text"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder="name@bank"
          value={upiId}
          onChange={(event) => {
            setUpiId(event.target.value)
            if (error) setError(null)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'manual-upi-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover active:scale-95"
          aria-label="Continue to payment"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p
          id="manual-upi-error"
          role="alert"
          className="mt-2 animate-shake text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}
    </form>
  )
}
