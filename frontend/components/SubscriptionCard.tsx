'use client'

import { useState } from 'react'
import ApprovePaymentModal from './ApprovePaymentModal'

interface Props {
  service: string
  token: string
  amount: string
  status: string
}

export default function SubscriptionCard({
  service,
  token,
  amount,
  status,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-5">
        <h3 className="text-lg font-semibold">{service}</h3>

        <div className="mt-2 flex gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-purple-500/20">ETH escrow</span>
          <span>{amount} / month</span>
        </div>

        <div className="mt-3">
          <span className="text-yellow-400 text-sm">{status}</span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-lg bg-purple-600 hover:bg-purple-700 py-2"
        >
          Approve Payment
        </button>
      </div>

      <ApprovePaymentModal
        open={open}
        onClose={() => setOpen(false)}
        amount={amount}
        token={token}
        nonce={0}
        expiry={300}
      />
    </>
  )
}
