import { House, Moon, ReceiptText, ScanLine, Settings, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Page } from '../types'

interface NavItem {
  page: Page
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { page: 'home', label: 'Pay', icon: House },
  { page: 'scan', label: 'Scan', icon: ScanLine },
  { page: 'history', label: 'Activity', icon: ReceiptText },
  { page: 'settings', label: 'Settings', icon: Settings },
]

interface NavbarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  isDark: boolean
  onToggleTheme: () => void
}

/**
 * App chrome: a quiet top bar with the wordmark, desktop links and a theme
 * toggle, plus a flat bottom tab bar on phones.
 */
export function Navbar({
  currentPage,
  onNavigate,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="flex h-14 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex h-11 items-center select-none"
            aria-label="Curie home"
          >
            <span className="font-display text-[27px] leading-none tracking-[-0.01em] text-ink">
              curie
            </span>
          </button>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 md:flex"
          >
            {NAV_ITEMS.map(({ page, label }) => {
              const active = currentPage === page
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 text-xs font-medium transition ${
                    active
                      ? 'text-ink'
                      : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-ink"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-paper-2 hover:text-ink"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper md:hidden"
      >
        <div className="mx-auto flex max-w-[520px] pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page
            return (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  active ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                <span
                  className={`absolute inset-x-0 top-0 mx-auto h-0.5 w-7 rounded-full ${
                    active ? 'bg-accent' : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 1.9 : 1.5}
                  aria-hidden="true"
                />
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
