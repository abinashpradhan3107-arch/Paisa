import { Clock3, House, ScanLine, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Page } from '../types'

interface NavItem {
  page: Page
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { page: 'home', label: 'Home', icon: House },
  { page: 'history', label: 'History', icon: Clock3 },
  { page: 'scan', label: 'Scan', icon: ScanLine },
  { page: 'profile', label: 'Profile', icon: UserRound },
]

interface BottomNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

/** Fixed bottom navigation with an elevated scan action. */
export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto max-w-[480px] border-t border-line bg-paper/95 backdrop-blur-xl">
        <div className="grid grid-cols-4 px-2 pb-[calc(0.4rem+env(safe-area-inset-bottom))] pt-2">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page
            const isScan = page === 'scan'

            if (isScan) {
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  aria-current={active ? 'page' : undefined}
                  aria-label="Scan a QR code"
                  className="group flex flex-col items-center justify-end gap-0.5 pb-0.5"
                >
                  <span className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_28px_rgba(201,242,124,0.22)] ring-4 ring-paper transition duration-150 group-active:scale-95">
                    <ScanLine
                      className="h-[22px] w-[22px]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-[10px] font-semibold text-ink">
                    {label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition ${
                  active ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? 'text-accent' : ''}`}
                  strokeWidth={active ? 1.9 : 1.6}
                  aria-hidden="true"
                />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
