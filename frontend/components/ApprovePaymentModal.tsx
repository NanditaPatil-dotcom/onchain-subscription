'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

type ApprovePaymentModalProps = {
  open: boolean
  onClose: () => void
  amount: string
  token: string
  nonce: number
  expiry: number // seconds until expiry
  onSign?: () => void
}

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
})

export default function ApprovePaymentModal({
  open,
  onClose,
  amount,
  token,
  nonce,
  expiry,
  onSign,
}: ApprovePaymentModalProps) {
  const [remaining, setRemaining] = useState(expiry)

  // Reset timer when modal opens or expiry changes
  useEffect(() => {
    if (!open) return
    setRemaining(expiry)
  }, [open, expiry])

  // Countdown effect
  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [open])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const countdown = useMemo(() => formatSeconds(remaining), [remaining])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-payment-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md p-[1px] rounded-2xl bg-purple-500 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-slate-950/80 backdrop-blur-xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    EIP-712 Consent
                  </p>
                  <h2
                    id="approve-payment-title"
                    className="text-xl font-semibold text-white"
                  >
                    Approve Subscription Payment
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-slate-300 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoBlock label="Amount" value={`${formatter.format(Number(amount))} ${token}`} />
                <InfoBlock label="Asset" value={token} />
                <InfoBlock label="Nonce" value={`#${nonce}`} />
                <InfoBlock label="Expires in" value={countdown} emphasize />
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                Cryptographic consent powers a single ETH payment from your escrow. No automatic renewals.
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(94,234,212,0.35)' }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                onClick={onSign}
                className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(88,28,135,0.4)] transition hover:shadow-[0_18px_50px_rgba(56,189,248,0.35)] active:translate-y-[1px]"
              >
                Sign Message (No Gas)
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function InfoBlock({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          emphasize ? 'text-emerald-200' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function formatSeconds(total: number) {
  const clamped = Math.max(0, Math.floor(total))
  const m = String(Math.floor(clamped / 60)).padStart(2, '0')
  const s = String(clamped % 60).padStart(2, '0')
  return `${m}:${s}`
}
