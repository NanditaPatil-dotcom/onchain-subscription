'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SERVICES } from '../lib/services'
import ServiceCard from './ServiceCard'

type Service = (typeof SERVICES)[number]

type NewSubscriptionModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (service: Service) => void
}

const methodLabels: Record<Service['mode'], string> = {
  EIP712: 'EIP-712 consent',
}

export default function NewSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
}: NewSubscriptionModalProps) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Service | null>(null)

  // Reset state whenever modal opens
  useEffect(() => {
    if (!isOpen) return
    setStep(1)
    setSelected(null)
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

  const billingCycle = useMemo(() => {
    if (!selected) return ''
    const days = Math.max(1, Math.round(selected.period / 86400))
    return `${days}-day cycle`
  }, [selected])

  if (typeof window === 'undefined') return null

  const handleNext = () => {
    if (step === 1 && selected) setStep(2)
    if (step === 2) setStep(3)
  }

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1))

  const handleConfirm = () => {
    if (!selected) return
    onConfirm(selected)
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-subscription-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/50 via-sky-500/40 to-indigo-500/30 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.9)]"
          >
            <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-8">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    Step {step} of 3
                  </p>
                  <h2
                    id="new-subscription-title"
                    className="text-2xl font-semibold text-white"
                  >
                    {step === 1 && 'Create new subscription'}
                    {step === 2 && 'Review subscription'}
                    {step === 3 && 'Deploy subscription'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {step === 1 && 'Choose a service to subscribe to'}
                    {step === 3 && 'Complete the on-chain setup to start billing'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </header>

              <div className="mt-6">
                <AnimatePresence mode="wait" initial={false}>
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      {SERVICES.map((svc) => (
                        <ServiceCard
                          key={svc.id}
                          name={svc.name}
                          description={svc.description}
                          token={svc.token}
                          amount={`${svc.amount}`}
                          selected={selected?.id === svc.id}
                          onClick={() => setSelected(svc)}
                        />
                      ))}
                    </motion.div>
                  )}

                  {step === 2 && selected && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <SummaryItem label="Service" value={selected.name} />
                      <SummaryItem
                        label="Amount"
                        value={`${selected.amount} ${selected.token}`}
                      />
                      <SummaryItem label="Asset" value={selected.token} />
                      <SummaryItem label="Billing cycle" value={billingCycle} />
                      <SummaryItem
                        label="Payment method"
                        value={methodLabels[selected.mode]}
                        highlight
                      />
                      <SummaryItem
                        label="Contract"
                        value={`${selected.address.slice(0, 6)}...${selected.address.slice(-4)}`}
                      />

                      <div className="sm:col-span-2 rounded-2xl border border-amber-300/30 bg-amber-400/30 p-4 text-sm text-amber-100 shadow-inner">
                        <p className="font-bold">Funds are escrowed.</p>
                        <p className="mt-1 text-amber-50/90">
                          Payments require cryptographic consent (EIP-712). No automatic renewals.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && selected && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="grid gap-4"
                    >
                      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/40 p-5">
                        <h3 className="mt-2 text-2xl font-semibold text-white">
                          {selected.name}
                        </h3>
                        <p className="mt-1 text-slate-400 text-sm">
                          {selected.amount} {selected.token} • {billingCycle} • {methodLabels[selected.mode]}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                          <Badge>ETH Escrow</Badge>
                          <Badge>No automatic renewals</Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <footer className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <StepDot active={step >= 1} />
                  <StepDot active={step >= 2} />
                  <StepDot active={step >= 3} />
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 sm:flex-none rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
                    >
                      Back
                    </button>
                  )}

                  {step < 3 && (
                    <button
                      onClick={handleNext}
                      disabled={step === 1 && !selected}
                      className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] transition hover:shadow-[0_16px_46px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Continue
                    </button>
                  )}

                  {step === 3 && (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 sm:flex-none rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] transition hover:shadow-[0_16px_46px_rgba(59,130,246,0.35)]"
                      >
                        Create subscription
                      </button>
                    </>
                  )}
                </div>
              </footer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-purple-400/60 bg-white/10' : 'border-white/10 bg-white/5'}`}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${highlight ? 'text-white' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  )
}

function StepDot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${active ? 'bg-gradient-to-r from-purple-400 to-sky-400' : 'bg-slate-600'}`}
    />
  )
}
