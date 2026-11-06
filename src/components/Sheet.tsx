import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** A native-feeling bottom sheet with backdrop and Escape support. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] animate-sheet rounded-t-[28px] border-t border-line bg-card px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-line-strong" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-card-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
