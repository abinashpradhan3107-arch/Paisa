import { lazy, Suspense, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomNav } from './components/BottomNav'
import { ProcessingAnimation } from './components/ProcessingAnimation'
import { SuccessScreen } from './components/SuccessScreen'
import { TransactionDetails } from './components/TransactionDetails'
import { HistoryPage } from './pages/History'
import { Home } from './pages/Home'
import { PaymentPage } from './pages/Payment'
import { ProfilePage } from './pages/Profile'
import type {
  Page,
  PaymentDetails,
  PaymentStep,
  Transaction,
  UpiPayload,
} from './types'
import {
  addTransaction,
  clearTransactions,
  createTransaction,
  loadBalance,
  loadSoundEnabled,
  loadTransactions,
  removeTransaction,
  saveBalance,
  saveSoundEnabled,
} from './utils/storage'
import { DEFAULT_BALANCE } from './utils/funding'
import { parseAmount } from './utils/amount'
import {
  primeSuccessSound,
  setSoundEnabled as applySoundEnabled,
} from './utils/sound'

const PROCESSING_DELAY_MS = 2000

/* The scanner pulls in html5-qrcode; load it only when the user needs it. */
const ScannerPage = lazy(() =>
  import('./pages/Scanner').then((module) => ({ default: module.ScannerPage })),
)

function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2
        className="h-6 w-6 animate-spin text-ink-faint"
        aria-label="Loading"
      />
    </div>
  )
}

/**
 * Root component. Owns navigation, the simulated balance, payment history and
 * the payment state machine so every screen shares one source of truth.
 */
function App() {
  const [page, setPage] = useState<Page>('home')
  const [step, setStep] = useState<PaymentStep | null>(null)
  const [payload, setPayload] = useState<UpiPayload | null>(null)
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [detail, setDetail] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadTransactions(),
  )
  const [balance, setBalance] = useState(() => loadBalance())
  const [draftAmount, setDraftAmount] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled())

  /* Keep the audio module in sync with the saved preference. */
  useEffect(() => {
    applySoundEnabled(soundEnabled)
  }, [soundEnabled])

  /* Keep the viewport at the top when the screen changes. */
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page, step])

  /* Lock the page behind the receipt overlay. */
  useEffect(() => {
    if (!detail) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [detail])

  /* Advance the simulation exactly once per checkout. */
  useEffect(() => {
    if (step !== 'processing' || !payment) return

    const timer = window.setTimeout(() => {
      const record = createTransaction({
        merchantName: payment.merchantName,
        payeeUpiId: payment.payeeUpiId,
        amount: payment.amount,
        fundingSource: payment.fundingSource,
        note: payment.note,
      })

      setTransaction(record)
      setTransactions(addTransaction(record))

      if (payment.fundingSource === 'wallet') {
        setBalance((current) => {
          const next =
            Math.round(Math.max(0, current - payment.amount) * 100) / 100
          saveBalance(next)
          return next
        })
      }

      setDraftAmount('')
      setStep('success')
    }, PROCESSING_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [step, payment])

  const resetFlow = () => {
    setStep(null)
    setPayload(null)
    setPayment(null)
    setTransaction(null)
    setDetail(null)
  }

  const handleNavigate = (nextPage: Page) => {
    resetFlow()
    setPage(nextPage)
  }

  const handleStartPayment = (nextPayload: UpiPayload) => {
    setDetail(null)
    setPayload(nextPayload)
    setPayment(null)
    setTransaction(null)
    setStep('recipient')
    setPage('home')
  }

  const handlePay = (details: PaymentDetails) => {
    /* Prime the chime while we still have the tap gesture. */
    primeSuccessSound()
    setPayment(details)
    setStep('processing')
  }

  const handleCancelPayment = () => {
    resetFlow()
    setPage('home')
  }

  const handleDone = () => {
    resetFlow()
    setDraftAmount('')
    setPage('home')
  }

  const handleViewDetails = () => {
    if (!transaction) return
    setDetail(transaction)
  }

  const handleOpenTransaction = (nextTransaction: Transaction) => {
    setDetail(nextTransaction)
  }

  const handleDeleted = (id: string) => {
    setTransactions(removeTransaction(id))
    resetFlow()
    setPage('history')
  }

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled)
    saveSoundEnabled(enabled)
  }

  const handleClearHistory = () => {
    clearTransactions()
    setTransactions([])
    if (detail) setDetail(null)
  }

  const handleResetBalance = () => {
    setBalance(DEFAULT_BALANCE)
    saveBalance(DEFAULT_BALANCE)
  }

  const initialAmount = payload
    ? payload.amount ?? parseAmount(draftAmount)
    : null

  const showScanner = step === null && page === 'scan'
  const showNav = step === null && page !== 'scan'

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-paper md:border-x md:border-line">
      <Suspense fallback={<PageLoader />}>
        {step === 'recipient' && payload ? (
          <PaymentPage
            payload={payload}
            initialAmount={initialAmount}
            balance={balance}
            onBack={handleCancelPayment}
            onPay={handlePay}
          />
        ) : step === 'processing' && payment ? (
          <ProcessingAnimation
            merchantName={payment.merchantName}
            amount={payment.amount}
            fundingSource={payment.fundingSource}
          />
        ) : step === 'success' && transaction ? (
          <SuccessScreen
            transaction={transaction}
            soundEnabled={soundEnabled}
            onViewDetails={handleViewDetails}
            onDone={handleDone}
          />
        ) : showScanner ? (
          <ScannerPage
            onScan={handleStartPayment}
            onClose={() => setPage('home')}
          />
        ) : page === 'home' ? (
          <Home
            transactions={transactions}
            balance={balance}
            amount={draftAmount}
            onAmountChange={setDraftAmount}
            onScan={() => handleNavigate('scan')}
            onStartPayment={handleStartPayment}
            onOpenTransaction={handleOpenTransaction}
            onViewHistory={() => handleNavigate('history')}
          />
        ) : page === 'history' ? (
          <HistoryPage
            transactions={transactions}
            onOpen={handleOpenTransaction}
            onScan={() => handleNavigate('scan')}
          />
        ) : (
          <ProfilePage
            balance={balance}
            soundEnabled={soundEnabled}
            onSoundChange={handleSoundChange}
            transactionCount={transactions.length}
            onClearHistory={handleClearHistory}
            onResetBalance={handleResetBalance}
          />
        )}
      </Suspense>

      {showNav && (
        <BottomNav currentPage={page} onNavigate={handleNavigate} />
      )}

      {detail && (
        <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-paper">
          <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-paper md:border-x md:border-line">
            <TransactionDetails
              transaction={detail}
              onBack={() => setDetail(null)}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
