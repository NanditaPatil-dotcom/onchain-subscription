'use client'

import { ReactNode } from 'react'

type SubscriptionCardProps = {
  subscriptionId: number
  serviceName: string
  amount: string
  period: string
  status: 'Awaiting Consent' | 'Paid' | 'Cancelled'
  token?: string
  onApprove?: () => void
  onCancel: (subscriptionId: number) => void | Promise<void>
  onWithdraw?: (subscriptionId: number) => void | Promise<void>
  hasEscrow?: boolean
  withdrawDisabled?: boolean
  approveDisabled?: boolean
  cancelDisabled?: boolean
  footer?: ReactNode
}

const badgeStyles: Record<SubscriptionCardProps['status'], string> = {
  'Awaiting Consent': 'bg-amber-500/15 text-amber-100 border border-amber-400/30',
  Paid: 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/30',
  Cancelled: 'bg-red-500/15 text-red-100 border border-red-400/30',
}

export default function SubscriptionCard({
  subscriptionId,
  serviceName,
  amount,
  period,
  status,
  token = 'ETH',
  onApprove,
  onCancel,
  onWithdraw,
  hasEscrow = false,
  withdrawDisabled,
  approveDisabled,
  cancelDisabled,
  footer,
}: SubscriptionCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-5 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_30%)] opacity-70" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-300">Service</p>
          <h3 className="text-lg font-semibold text-white">{serviceName}</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {token}
        </span>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">{amount}</span>
        <span className="text-sm text-slate-400">{period}</span>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status]}`}>
          {status === 'Cancelled' ? 'Cancelled' : status}
        </span>
        {status === 'Awaiting Consent' && onApprove && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition hover:shadow-[0_15px_40px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={approveDisabled}
            onClick={() => onApprove()}
          >
            Approve Payment
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap gap-2">
        {status !== 'Cancelled' ? (
          <button
            type="button"
            onClick={() => onCancel(subscriptionId)}
            className="mt-1 rounded-lg border border-red-500/40 text-red-400 px-4 py-2 text-sm hover:bg-red-500/10 transition"
            disabled={cancelDisabled}
          >
            Cancel subscription
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {hasEscrow && onWithdraw ? (
              <button
                type="button"
                onClick={() => onWithdraw(subscriptionId)}
                className="mt-1 rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 px-4 py-2 text-sm hover:border-emerald-300/60 hover:bg-emerald-500/15 transition"
                disabled={withdrawDisabled}
              >
                Withdraw escrow
              </button>
            ) : (
              // spacer keeps card height consistent when button is hidden
              <div className="mt-1 h-[38px]" aria-hidden />
            )}
          </div>
        )}
        {footer}
      </div>
    </article>
  )
}
