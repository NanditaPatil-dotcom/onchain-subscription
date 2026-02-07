'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

type AddFundsModalProps = {
  isOpen: boolean
  onClose: () => void
  onAdd: (amountEth: string) => Promise<void>
  currentEscrowEth: string
  costPerPeriodEth: string
  loading?: boolean
}

export default function AddFundsModal({
  isOpen,
  onClose,
  onAdd,
  currentEscrowEth,
  costPerPeriodEth,
  loading = false,
}: AddFundsModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const amountIsValid = useMemo(() => {
    if (!amount.trim()) return false
    const n = Number(amount)
    return Number.isFinite(n) && n > 0
  }, [amount])

  // Reset internal state whenever the modal opens
  useEffect(() => {
    if (!isOpen) return
    setAmount('')
    setError(null)
    setSubmitting(false)
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (typeof window === 'undefined') return null
  if (!isOpen) return null

  const handleAddClick = async () => {
    if (!amountIsValid || submitting || loading) return
    setSubmitting(true)
    setError(null)
    try {
      await onAdd(amount)
      onClose()
    } catch (err: any) {
      if (err?.code === 4001) {
        setError('Transaction rejected in wallet.')
      } else if (err?.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient ETH to cover amount and gas.')
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Unexpected error. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = !amountIsValid || submitting || loading

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-funds-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  Escrow
                </p>
                <h2 id="add-funds-title" className="text-xl font-semibold text-white">
                  Add funds to escrow
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </header>

            <div className="mt-6 space-y-3">
              <label className="block text-sm text-slate-200">
                ETH amount
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.0001"
                  min="0"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoTile label="Current escrow" value={`${currentEscrowEth} ETH`} />
                <InfoTile label="Cost per period" value={`${costPerPeriodEth} ETH`} />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}
            </div>

            <footer className="mt-6 flex gap-3">
              <button
                onClick={handleAddClick}
                disabled={disabled}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] transition ${
                  disabled
                    ? 'bg-indigo-500/40 cursor-not-allowed'
                    : 'bg-indigo-500/40 hover:shadow-[0_16px_46px_rgba(59,130,246,0.35)]'
                }`}
              >
                {submitting || loading ? 'Adding...' : 'Add ETH'}
              </button>
              <button
                onClick={onClose}
                disabled={submitting || loading}
                className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
