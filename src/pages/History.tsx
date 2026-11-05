import { useState } from 'react'
import { DemoBadge } from '../components/DemoBadge'
import { Navbar } from '../components/Navbar'
import { SimulatedTransaction, getAllTransactions, clearAllTransactions } from '../utils/storage'

/**
 * History page - displays local transaction history.
 * Shows authentic UPI transaction format with Transaction ID, RRN, and sender details.
 */
export function HistoryPage() {
  const [transactionHistory, setTransactionHistory] = useState<
    SimulatedTransaction[]
  >([])
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  // Load history on component mount
  useEffect(() => {
    setTransactionHistory(getAllTransactions())
  }, [])

  const handleClearHistory = () => {
    setShowClearConfirmation(true)
  }

  const confirmClearHistory = () => {
    clearAllTransactions()
    setTransactionHistory([])
    setShowClearConfirmation(false)
  }

  const cancelClearHistory = () => {
    setShowClearConfirmation(false)
  }

  // Generate a 14-character alphanumeric Transaction ID
  const generateTransactionId = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 14; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  // Generate a 10-digit RRN (Reference Number)
  const generateRRN = (): string => {
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }
    return result
  }

  // Format date in UPI style
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* DEMO badge */}
      <DemoBadge />

      {/* Navbar */}
      <Navbar
        currentPage={'history'}
        onPageChange={() => {}}
        showDemoBadge={true}
      />

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Transaction History
          </h1>
          <p className="text-lg text-gray-600">
            Your DEMO transaction history
          </p>
        </header>

        {/* Clear history button */}
        {transactionHistory.length > 0 && (
          <div className="mb-6 text-right">
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              aria-label="Clear transaction history"
            >
              Clear All History
            </button>
          </div>
        )}

        {/* History content */}
        <section className="pt-8">
          {/* No transactions message */}
          {transactionHistory.length === 0 && (
            <div className="min-h-[300px] flex items-center justify-center text-center">
              <p className="text-gray-400">
                No DEMO transactions yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Scan a QR code to get started!
              </p>
            </div>
          )}

          {/* Transaction list */}
          {transactionHistory.length > 0 && (
            <div className="space-y-4">
              {transactionHistory.map((transaction) => {
                // Generate authentic-looking transaction ID and RRN
                const transactionId = generateTransactionId()
                const rrn = generateRRN()
                const formattedDate = formatDate(transaction.timestamp)

                return (
                  <div
                    key={transaction.id}
                    className="p-6 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Could open transaction details modal
                    }}
                  >
                    {/* Top row - Transaction info */}
                    <div className="flex items-start justify-between">
                      {/* Left side - Transaction details */}
                      <div className="flex-1 min-w-0">
                        {/* Sender info - mimicking UPI app style */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Sender avatar */}
                          <div
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 flex-shrink-0"
                          >
                            {transaction.merchantName
                              .split(' ')
                              .slice(0, 1)
                              .map((c) => c[0])
                              .join('')}
                          </div>
                          {/* Sender name */}
                          <span className="text-sm font-medium text-primary-600">
                            {transaction.merchantName}
                          </span>
                        </div>

                        {/* Transaction ID and RRN */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                          <div>
                            <p className="font-medium text-xs uppercase tracking-wider">
                              Transaction ID
                            </p>
                            <p className="break-all text-primary-600 font-medium">
                              {transactionId}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-xs uppercase tracking-wider">
                              RRN
                            </p>
                            <p className="break-all text-green-600 font-medium">
                              {rrn}
                            </p>
                          </div>
                        </div>

                        {/* Amount and date */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-lg font-bold text-primary-600">
                            {transaction.amount}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formattedDate}
                          </p>
                        </div>
                      </div>

                      {/* Right side - Status/DEMO tag */}
                      <div className="mt-6 flex-shrink-0">
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                        >
                          DEMO
                        </span>
                      </div>
                    </div>

                    {/* Divider or separator */}
                    {transaction !== transactionHistory[transactionHistory.length - 1] && (
                      <div className="border-t border-gray-100 my-4"></div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {transactionHistory.length === 0 && (
            <div className="min-h-[300px] flex items-center justify-center text-center">
              <p className="text-gray-400">
                No DEMO transactions yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Scan a QR code to get started!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}