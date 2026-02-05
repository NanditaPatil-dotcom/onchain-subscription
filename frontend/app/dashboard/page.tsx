'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ApprovePaymentModal from '@/components/ApprovePaymentModal'
import { getContract, getSigner } from '@/lib/web3'
import { ethers } from 'ethers'
import { signApproval } from '@/lib/signature'
import { signPermit2Transfer } from '@/lib/permit2'
import { constants } from 'ethers'

type StatCard = {
  label: string
  value: string
  helper: string
}

type Subscription = {
  service: string
  token: 'ETH' | 'USDC' | 'DAI' | string
  amount: string
  cadence: string
  status: 'Awaiting Consent' | 'Paid'
}

const stats: StatCard[] = [
  { label: 'Active subscriptions', value: '12', helper: '+3 this week' },
  { label: 'Escrowed balance', value: '18.4 ETH', helper: '≈ $52,300' },
  { label: 'Pending approvals', value: '4', helper: '2 expiring today' },
]

const subscriptions: Subscription[] = [
  {
    service: 'Notion AI',
    token: 'ETH',
    amount: '0.01',
    cadence:"per month",
    status: 'Awaiting Consent',
  }
]

const statusStyles: Record<Subscription['status'], string> = {
  'Awaiting Consent': 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  Paid: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30',
}

export default function DashboardPage() {
  const [selected, setSelected] = useState<Subscription | null>(null)
  const [demoSubs, setDemoSubs] = useState<Subscription[]>(subscriptions)
  const [subs, setSubs] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [signingIndex, setSigningIndex] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [signing, setSigning] = useState(false)
  const [expiryTs, setExpiryTs] = useState<number>(0)
  const [approval, setApproval] = useState<{
    subscriptionId: number
    signature: string
    expiry: number
    amount: any
    nonce: any
    isToken: boolean
    permit?: any
  } | null>(null)

  const load = useCallback(async () => {
    try {
      try {
        const contract = await getContract()
        const countBN = await contract.nextSubscriptionId()
        const count = Number(countBN.toString())

        const data = []
        for (let i = 0; i < count; i++) {
          const s = await contract.subscriptions(i)
          data.push(s)
        }

        setSubs(data)
      } catch (err) {
        console.error('Failed to load subscriptions:', err)
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreateSubscription() {
    if (creating) return
    const serviceAddress = window.prompt('Service address (0x...)')
    if (!serviceAddress) return

    setCreating(true)
    try {
      const contract = await getContract(true)
      const tx = await contract.createSubscription(
        serviceAddress,
        ethers.utils.parseEther('0.01'),
        30 * 24 * 60 * 60,
        { value: ethers.utils.parseEther('0.1') }
      )
      await tx.wait()
      await load()
    } catch (err) {
      console.error('Subscription creation failed:', err)
      window.alert('Subscription creation failed. Check console for details.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-600/25 blur-[120px]" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute inset-x-10 bottom-0 h-64 rounded-[32px] bg-gradient-to-r from-purple-700/25 via-blue-700/15 to-emerald-500/20 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Header />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <p className="text-sm uppercase tracking-wide text-slate-300">{item.label}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-white">{item.value}</span>
                <span className="text-xs text-slate-400">{item.helper}</span>
              </div>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
              <p className="text-sm text-slate-400">
                Manage recurring agreements and approve upcoming payments.
              </p>
            </div>
            <button
              onClick={handleCreateSubscription}
              disabled={creating}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'New subscription'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoSubs.map((sub) => (
              <motion.article
                key={sub.service}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-5 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_30%)] opacity-70" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-300">Service</p>
                    <h3 className="text-lg font-semibold text-white">{sub.service}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {sub.token}
                  </span>
                </div>

                <div className="relative mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">{sub.amount}</span>
                  <span className="text-sm text-slate-400">{sub.cadence}</span>
                </div>

                <div className="relative mt-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[sub.status]}`}>
                    {sub.status}
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(59,130,246,0.35)' }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition hover:shadow-[0_15px_40px_rgba(59,130,246,0.35)]"
                    disabled={sub.status === 'Paid'}
                    aria-disabled={sub.status === 'Paid'}
                    onClick={() => {
                      if (sub.status === 'Paid') return
                      setSelected(sub)
                      // default to the first on-chain subscription for signing if user launches from the sample card
                      if (subs.length > 0) {
                        setSigningIndex(0)
                      } else {
                        setSigningIndex(null)
                      }
                    }}
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
                  </motion.button>
                </div>

                <div className="relative mt-4 h-px w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
                <p className="relative mt-3 text-xs text-slate-400">
                  Secure, non-custodial approvals routed through your escrow.
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">On-chain Subscriptions</h3>
            <p className="text-sm text-slate-400">Live read from contract</p>
          </div>
          <div className="mt-4 space-y-3">
            {subs.length === 0 && (
              <p className="text-sm text-slate-400">No subscriptions found.</p>
            )}
            {subs.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-200"
              >
                <span className="font-mono text-xs text-slate-300">
                  #{i} — {s.subscriber ?? 'N/A'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">
                    {s.amount ? s.amount.toString() : '0'} {s.token === constants.AddressZero ? 'wei' : 'tokens'}
                  </span>
                  <button
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:border-white/30 hover:bg-white/15 transition"
                    disabled={signing}
                    onClick={() => {
                      setSelected({
                        service: 'On-chain',
                        token: s.token === constants.AddressZero ? 'ETH' : s.token ?? 'TOKEN',
                        amount: s.amount ? s.amount.toString() : '0',
                        cadence: 'per period',
                        status: 'Awaiting Consent',
                      })
                      setSigningIndex(i)
                      setExpiryTs(Math.floor(Date.now() / 1000) + 300)
                    }}
                  >
                    {signing ? 'Signing...' : s.token === constants.AddressZero ? 'Approve (ETH)' : 'Permit2 + Claim'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <ApprovePaymentModal
          open={!!selected}
          onClose={() => {
            setSelected(null)
            setSigningIndex(null)
          }}
          onSign={() => {
            void handleSign()
          }}
          amount={selected?.amount ?? '0'}
          token={selected?.token ?? 'ETH'}
          nonce={selected ? Math.floor(Math.random() * 10000) : 0}
          expiry={Math.max(0, expiryTs - Math.floor(Date.now() / 1000)) || 300}
        />
        {signature && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100 space-y-2">
            <div>
              Signature ready: <span className="break-all font-mono">{signature}</span>
            </div>
            <button
              disabled={claiming}
              onClick={() => void handleClaim()}
              className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-50 hover:border-emerald-300/50 hover:bg-emerald-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming...' : 'Claim payment'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )

  async function handleSign() {
    if (signing) return
    let index = signingIndex
    if (index === null) {
      if (subs.length === 0) {
        window.alert('No on-chain subscription to sign. Create one first.')
        return
      }
      index = 0
      setSigningIndex(0)
      setExpiryTs(Math.floor(Date.now() / 1000) + 300)
    }
    if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      window.alert('Missing NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env')
      return
    }
    setSigning(true)
    try {
      const signer = await getSigner()
      const sub = subs[index]
      const subscriptionId = index
      const amountBN = sub?.amount ? ethers.BigNumber.from(sub.amount) : ethers.constants.Zero
      const balanceBN = sub?.balance ? ethers.BigNumber.from(sub.balance) : amountBN
      const payAmount = balanceBN.gt(amountBN) ? amountBN : balanceBN
      const nonce = sub?.nonce ?? 0
      const expiry = Math.floor(Date.now() / 1000) + 900 // absolute timestamp (15m window)

      let sig: string
      if (sub?.token && sub.token !== constants.AddressZero) {
        // Token subscription: use Permit2 signature
        const permitSig = await signPermit2Transfer({
          signer,
          token: sub.token,
          amount: payAmount,
          nonce,
          deadline: expiry,
          to: sub.service ?? (await signer.getAddress()),
          spender: sub.service ?? (await signer.getAddress()),
        })
        sig = permitSig.signature
        // Store permit payload on the sub for later claim
        setApproval({
          subscriptionId,
          signature: permitSig.signature,
          expiry,
          amount: payAmount,
          nonce,
          isToken: true,
          permit: permitSig,
        })
      } else {
        // ETH flow: EIP-712 approval
        sig = await signApproval({
          signer,
          subscriptionId,
          amount: payAmount,
          nonce,
          expiry,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        })
        setApproval({
          subscriptionId,
          signature: sig,
          expiry,
          amount: payAmount,
          nonce,
          isToken: false,
        })
      }

      setSignature(sig)
      setSelected(null)
    } catch (err) {
      console.error('Signing failed:', err)
      window.alert('Signing failed. Check console for details.')
    } finally {
      setSigning(false)
    }
  }

  async function handleClaim() {
    if (!approval) {
      window.alert('Sign first to prepare claim.')
      return
    }
    const {
      subscriptionId,
      signature: sig,
      expiry,
      amount,
      nonce,
      isToken,
      permit,
    } = approval

    setClaiming(true)
    try {
      const contract = await getContract(true)

      const tx = isToken && permit
        ? await contract.claimPaymentWithPermit2(
            subscriptionId,
            permit.permit,
            permit.transferDetails,
            permit.signature
          )
        : await contract.claimPayment(
            subscriptionId,
            amount,
            nonce,
            expiry,
            sig
          )
      await tx.wait()
      window.alert('Payment claimed on-chain!')
      await load()
      setApproval(null)
      setSignature(null)
      // Mark demo card as paid for UX feedback
      setDemoSubs((prev) =>
        prev.map((s, idx) =>
          idx === 0 ? { ...s, status: 'Paid' } : s
        )
      )
    } catch (err) {
      console.error('Claim failed:', err)
      window.alert('Claim failed. Check console for details.')
    } finally {
      setClaiming(false)
    }
  }
}

function Header() {
  const wallet = '0xA2f3...9bC4'
  const network = 'Sepolia'

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-300">DeFi Dashboard</p>
        <h1 className="text-2xl font-semibold text-white">Subscriptions & Escrow</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {network}
        </span>
        <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-sm font-mono text-slate-100 shadow-inner shadow-white/5">
          {wallet}
        </span>
        <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/15">
          Switch wallet
        </button>
      </div>
    </header>
  )
}
