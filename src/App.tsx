import { lazy, Suspense, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Navbar } from './components/Navbar'
import { ProcessingAnimation } from './components/ProcessingAnimation'
import { SuccessAnimation } from './components/SuccessAnimation'
import { HistoryPage } from './pages/History'
import { Home } from './pages/Home'
import { PaymentPage } from './pages/Payment'
import { SettingsPage } from './pages/Settings'
import type {
  Page,
  PaymentDetails,
  PaymentStep,
  ThemePreference,
  Transaction,
  UpiPayload,
} from './types'
import {
  addTransaction,
  clearTransactions,
  formatTimestamp,
  generateReference,
  loadSoundEnabled,
  loadTheme,
  loadTransactions,
  removeTransaction,
  saveSoundEnabled,
  saveTheme,
} from './utils/storage'
import {
  primeSuccessSound,
  setSoundEnabled as applySoundEnabled,
} from './utils/sound'

const PROCESSING_DELAY_MS = 1600

/* The scanner pulls in html5-qrcode; load it only when the user needs it. */
const ScannerPage = lazy(() =>
  import('./pages/Scanner').then((module) => ({ default: module.ScannerPage })),
)

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader2
        className="h-6 w-6 animate-spin text-ink-faint"
        aria-label="Loading"
      />
    </div>
  )
}

/**
 * Root component. Owns navigation, the theme preference, payment history and
 * the payment state machine so every screen shares one source of truth.
 */
function App() {
  const [page, setPage] = useState<Page>('home')
  const [step, setStep] = useState<PaymentStep | null>(null)
  const [payload, setPayload] = useState<UpiPayload | null>(null)
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadTransactions(),
  )
  const [theme, setTheme] = useState<ThemePreference>(() => loadTheme())
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled())
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  /* Track the OS theme so "system" stays live. */
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const isDark = theme === 'dark' || (theme === 'system' && systemDark)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  /* Keep the audio module in sync with the saved preference. */
  useEffect(() => {
    applySoundEnabled(soundEnabled)
  }, [soundEnabled])

  /* Keep the viewport at the top when the screen changes. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, step])

  /* Advance the payment exactly once per checkout. */
  useEffect(() => {
    if (step !== 'processing' || !payment) return

    const timer = window.setTimeout(() => {
      const timestamp = Date.now()
      const reference = generateReference()
      const record: Transaction = {
        id: reference,
        reference,
        merchantName: payment.merchantName,
        payeeUpiId: payment.payeeUpiId,
        amount: payment.amount,
        currency: 'INR',
        date: formatTimestamp(timestamp),
        timestamp,
      }

      setTransaction(record)
      setTransactions(addTransaction(record))
      setStep('success')
    }, PROCESSING_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [step, payment])

  const handleNavigate = (nextPage: Page) => {
    setPage(nextPage)
    setStep(null)
    setPayload(null)
    setPayment(null)
    setTransaction(null)
  }

  const handleStartPayment = (nextPayload: UpiPayload) => {
    setPayload(nextPayload)
    setPayment(null)
    setTransaction(null)
    setStep('details')
  }

  const handlePay = (amount: number) => {
    if (!payload) return
    /* Prime the chime while we still have the tap gesture. */
    primeSuccessSound()
    setPayment({
      merchantName: payload.merchantName,
      payeeUpiId: payload.payeeUpiId,
      amount,
    })
    setStep('processing')
  }

  const handleCancelPayment = () => {
    setStep(null)
    setPayload(null)
    setPayment(null)
    setTransaction(null)
    setPage('home')
  }

  const handleNewPayment = () => {
    setStep(null)
    setPayload(null)
    setPayment(null)
    setTransaction(null)
    setPage('home')
  }

  const handleViewHistory = () => {
    setStep(null)
    setPayload(null)
    setPayment(null)
    setTransaction(null)
    setPage('history')
  }

  const handleThemeChange = (nextTheme: ThemePreference) => {
    setTheme(nextTheme)
    saveTheme(nextTheme)
  }

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled)
    saveSoundEnabled(enabled)
  }

  const handleToggleTheme = () => {
    handleThemeChange(isDark ? 'light' : 'dark')
  }

  const handleRemoveTransaction = (id: string) => {
    setTransactions(removeTransaction(id))
  }

  const handleClearHistory = () => {
    clearTransactions()
    setTransactions([])
  }

  const inPaymentFlow = step !== null

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[520px] bg-paper md:border-x md:border-line">
      {!inPaymentFlow && (
        <Navbar
          currentPage={page}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      <main>
        <Suspense fallback={<PageLoader />}>
          {step === 'details' && payload && (
            <PaymentPage
              payload={payload}
              onBack={handleCancelPayment}
              onPay={handlePay}
            />
          )}

          {step === 'processing' && payment && (
            <ProcessingAnimation
              merchantName={payment.merchantName}
              amount={payment.amount}
            />
          )}

          {step === 'success' && transaction && (
            <SuccessAnimation
              transaction={transaction}
              onNewPayment={handleNewPayment}
              onViewHistory={handleViewHistory}
              soundEnabled={soundEnabled}
            />
          )}

          {!inPaymentFlow && page === 'home' && (
            <Home
              transactions={transactions}
              onScan={() => handleNavigate('scan')}
              onStartPayment={handleStartPayment}
              onViewHistory={() => handleNavigate('history')}
            />
          )}

          {!inPaymentFlow && page === 'scan' && (
            <ScannerPage onScan={handleStartPayment} />
          )}

          {!inPaymentFlow && page === 'history' && (
            <HistoryPage
              transactions={transactions}
              onScan={() => handleNavigate('scan')}
              onRemove={handleRemoveTransaction}
              onClear={handleClearHistory}
            />
          )}

          {!inPaymentFlow && page === 'settings' && (
            <SettingsPage
              theme={theme}
              onThemeChange={handleThemeChange}
              soundEnabled={soundEnabled}
              onSoundChange={handleSoundChange}
              transactionCount={transactions.length}
              onClearHistory={handleClearHistory}
            />
          )}
        </Suspense>
      </main>
    </div>
  )
}

export default App
