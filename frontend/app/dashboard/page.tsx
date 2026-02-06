'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ApprovePaymentModal from '@/components/ApprovePaymentModal'
import NewSubscriptionModal from '@/components/NewSubscriptionModal'
import SubscriptionCard from '@/components/SubscriptionCard'
import { getContract, getSigner, getProvider } from '@/lib/web3'
import { ethers } from 'ethers'
import { signApproval } from '@/lib/signature'
import { SERVICES } from '@/lib/services'

type StatCard = {
  label: string
  value: string
}

type Subscription = {
  service: string
  token: 'ETH'
  amount: string
  cadence: string
  status: 'Awaiting Consent' | 'Paid' | 'Cancelled'
  mode?: 'EIP712'
}

type Service = (typeof SERVICES)[number]
type ChainSub = {
  subscriber: string
  service: string
  amount: ethers.BigNumber
  period: ethers.BigNumber
  lastPaid: ethers.BigNumber
  nonce: ethers.BigNumber
  balance: ethers.BigNumber
  active: boolean
  id: number
}

export default function DashboardPage() {
  const [selected, setSelected] = useState<Subscription | null>(null)
  const [subs, setSubs] = useState<ChainSub[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [signingIndex, setSigningIndex] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [signing, setSigning] = useState(false)
  const [expiryTs, setExpiryTs] = useState<number>(0)
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null)
  const [approval, setApproval] = useState<{
    subscriptionId: number
    signature: string
    expiry: number
    amount: any
    nonce: any
  } | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      try {
        const contract = await getContract()
        const countBN = await contract.nextSubscriptionId()
        const count = Number(countBN.toString())

        const data: ChainSub[] = []
        for (let i = 0; i < count; i++) {
          const s = await contract.subscriptions(i)
          data.push({
            id: i,
            subscriber: s.subscriber,
            service: s.service,
            amount: ethers.BigNumber.from(s.amount ?? 0),
            period: ethers.BigNumber.from(s.period ?? 0),
            lastPaid: ethers.BigNumber.from(s.lastPaid ?? 0),
            nonce: ethers.BigNumber.from(s.nonce ?? 0),
            balance: ethers.BigNumber.from(s.balance ?? 0),
            active: s.active,
          })
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

  // keep a lightweight view of the connected account for stats
  useEffect(() => {
    const syncAccount = async () => {
      try {
        const provider = getProvider()
        const accounts: string[] = await provider.send('eth_accounts', [])
        setAccount(accounts[0]?.toLowerCase() ?? null)
      } catch (err) {
        console.warn('Account sync skipped:', err)
      }
    }

    syncAccount()

    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccounts = (accounts: string[]) =>
      setAccount(accounts[0]?.toLowerCase() ?? null)
    window.ethereum.on('accountsChanged', handleAccounts)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccounts)
    }
  }, [])

  // derive UI cards from on-chain subs: single source of truth for UX
  const cards = useMemo(() => {
    return subs
      .map((sub) => {
        const meta = SERVICES.find(
          (svc) => svc.address.toLowerCase() === sub.service.toLowerCase(),
        )
        const amountFormatted = ethers.utils.formatEther(sub.amount ?? 0)

        const now = Math.floor(Date.now() / 1000)
        const due =
          sub.active &&
          (sub.lastPaid
            ? now >= Number(sub.lastPaid) + Number(sub.period)
            : true)
        const hasFunds =
          sub.active &&
          ethers.BigNumber.from(sub.balance ?? 0).gte(sub.amount ?? 0)
        const status: Subscription['status'] = sub.active
          ? due && hasFunds
            ? 'Awaiting Consent'
            : 'Paid'
          : 'Cancelled'

        return {
          id: sub.id,
          service: meta?.name ?? `Service ${sub.id}`,
          token: 'ETH' as const,
          amount: amountFormatted,
          cadence: `${Math.max(1, Math.round(Number(sub.period) / 86400))}-day cycle`,
          status,
          mode: meta?.mode ?? 'EIP712',
          raw: sub,
          due,
          hasFunds,
          hasEscrow: ethers.BigNumber.from(sub.balance ?? 0).gt(0),
        }
      })
  }, [subs])

  const stats: StatCard[] = useMemo(() => {
    const activeCount = subs.filter((s) => s.active).length

    const escrowTotal = subs
      .filter(
        (s) =>
          s.active &&
          account &&
          (s.subscriber ?? '').toLowerCase() === account.toLowerCase(),
      )
      .reduce((acc, s) => acc.add(s.balance ?? 0), ethers.BigNumber.from(0))

    const now = Math.floor(Date.now() / 1000)
    const pendingApprovals = subs.filter((s) => {
      if (!s.active) return false
      if (!account) return false
      if ((s.subscriber ?? '').toLowerCase() !== account.toLowerCase()) return false
      const due = now >= Number(s.lastPaid ?? 0) + Number(s.period ?? 0)
      return due
    }).length

    return [
      {
        label: 'Active subscriptions',
        value: String(activeCount)
      },
      {
        label: 'Escrowed balance',
        value: `${ethers.utils.formatEther(escrowTotal)} ETH`
      },
      {
        label: 'Pending approvals',
        value: String(pendingApprovals)
      },
    ]
  }, [account, subs])

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-600/25 blur-[120px]" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute inset-x-10 bottom-0 h-64 rounded-[32px] bg-gradient-to-r from-purple-700/25 via-blue-700/15 to-emerald-500/20 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 min-h-screen w-full px-8 lg:px-14 xl:px-20 py-10 lg:py-14"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-12 gap-y-12 gap-x-16">
          {/* Left column */}
          <div className="col-span-12 space-y-10 lg:col-span-6">
            <div className="space-y-10">
              <Header />

              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {stats.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  >
                    <p className="text-sm uppercase tracking-wide text-slate-300">{item.label}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-white">{item.value}</span>
                    </div>
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
                  </article>
                ))}
              </section>
            </div>

            <section className="space-y-5 mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
                >
                  New subscription
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.length === 0 && (
                  <p className="text-sm text-slate-400">No funded subscriptions yet.</p>
                )}
                {cards.map((sub) => (
                  <motion.div
                    key={sub.id}
                    className="w-full"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <SubscriptionCard
                      subscriptionId={sub.id}
                      serviceName={sub.service}
                      amount={sub.amount}
                      period={sub.cadence}
                      status={sub.status}
                      token="ETH"
                      onApprove={
                        sub.status === 'Awaiting Consent'
                          ? () => {
                              if (!sub.due) return
                              setSelected({
                                service: sub.service,
                                token: 'ETH',
                                amount: sub.amount,
                                cadence: sub.cadence,
                                status: sub.status,
                                mode: sub.mode as Subscription['mode'],
                              })
                              setSigningIndex(sub.raw.id)
                              setExpiryTs(Math.floor(Date.now() / 1000) + 300)
                            }
                          : undefined
                      }
                      approveDisabled={!sub.due || !sub.hasFunds}
                      onCancel={(id) => void cancelSubscription(id)}
                      cancelDisabled={cancelingId === sub.id}
                      onWithdraw={(id) => void withdrawEscrow(id)}
                      hasEscrow={sub.hasEscrow}
                      withdrawDisabled={withdrawingId === sub.id}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: read-only mirror */}
          <section className="col-span-12 lg:col-span-6 lg:pl-4 xl:pl-8">
            <div className="h-full min-h-[80vh] space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-6 lg:p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">On-chain Subscriptions</h3>
                <p className="text-sm text-slate-400">Read-only mirror of contract state</p>
              </div>
              <div className="mt-5 space-y-4">
                {subs.length === 0 && (
                  <p className="text-sm text-slate-400">No subscriptions found.</p>
                )}
                {subs.map((s, i) => {
                  const meta = SERVICES.find(
                    (svc) => svc.address.toLowerCase() === (s.service ?? '').toLowerCase(),
                  )
                  const tokenSymbol = 'ETH'
                  const amountDisplay = ethers.utils.formatEther(s.amount ?? 0)
                  return (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-200"
                    >
                      <span className="font-mono text-xs text-slate-300">
                        #{i} — subscriber {s.subscriber ?? 'N/A'}
                      </span>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white">
                          service {meta?.name ?? s.service ?? 'N/A'}
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white">
                          {amountDisplay} {tokenSymbol} per period
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white">
                          escrow {ethers.utils.formatEther(s.balance ?? 0)} ETH
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white">
                          nonce #{s.nonce?.toString() ?? '0'}
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white">
                          lastPaid {Number(s.lastPaid ?? 0)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
        <NewSubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={async (service) => {
            await handleCreateSubscription(service)
          }}
        />
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
          token="ETH"
          nonce={
            signingIndex !== null
              ? Number(subs.find((s) => s.id === signingIndex)?.nonce ?? 0)
              : 0
          }
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

  async function cancelSubscription(subscriptionId: number) {
    const confirmed = window.confirm(
      'Cancel this subscription? Future payments will stop; past payments stay recorded.'
    )
    if (!confirmed) return

    try {
      setCancelingId(subscriptionId)
      const contract = await getContract(true)
      const tx = await contract.cancelSubscription(subscriptionId)
      await tx.wait()
      window.alert('Subscription cancelled.')
      await load()
    } catch (err) {
      console.error('Cancel failed:', err)
      window.alert('Cancel failed. Check console for details.')
    } finally {
      setCancelingId(null)
    }
  }

  async function withdrawEscrow(subscriptionId: number) {
    const confirmed = window.confirm(
      'Withdraw unused escrow? This is only available after cancellation.'
    )
    if (!confirmed) return

    try {
      setWithdrawingId(subscriptionId)
      const contract = await getContract(true)
      const tx = await contract.withdrawEscrow(subscriptionId)
      await tx.wait()
      window.alert('Escrow withdrawn to your wallet.')
      await load()
    } catch (err) {
      console.error('Withdraw failed:', err)
      window.alert('Withdraw failed. Check console for details.')
    } finally {
      setWithdrawingId(null)
    }
  }

  // Plug-in point for creating subscriptions on-chain based on selected service
  async function handleCreateSubscription(service: Service) {
    try {
      const contract = await getContract(true)

      await contract.createSubscription(
        service.address,
        ethers.utils.parseEther(service.amount),
        service.period,
        { value: ethers.utils.parseEther(service.amount) },
      )

      await load()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Subscription creation failed:', err)
      window.alert('Subscription creation failed. Check console for details.')
    }
  }

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
    }
    if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      window.alert('Missing NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env')
      return
    }
    setSigning(true)
    try {
      const contract = await getContract()
      const fresh = await contract.subscriptions(index)
      const signer = await getSigner()
      const subscriptionId = index
      const amountBN = ethers.BigNumber.from(fresh.amount ?? 0)
      const balanceBN = ethers.BigNumber.from(fresh.balance ?? 0)
      const payAmount = balanceBN.gte(amountBN) ? amountBN : balanceBN
      const nonce = fresh.nonce ?? 0
      const expiry = Math.floor(Date.now() / 1000) + 900 // absolute timestamp (15m window)

      const sig = await signApproval({
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
      })

      setSignature(sig)
      setSelected(null)
      setExpiryTs(expiry)
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
    const { subscriptionId, signature: sig, expiry, amount, nonce } = approval

    setClaiming(true)
    try {
      const contract = await getContract(true)

      const tx = await contract.claimPayment(
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
    } catch (err) {
      console.error('Claim failed:', err)
      window.alert('Claim failed. Check console for details.')
    } finally {
      setClaiming(false)
    }
  }
}

function Header() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Map a few common chainIds to friendly names; falls back to numeric id.
  const chainName = useMemo(() => {
    if (!chainId) return 'Not connected'
    const lookup: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      8453: 'Base',
    }
    return `${lookup[chainId] ?? 'Chain'}`
  }, [chainId])

  useEffect(() => {
    const syncFromProvider = async () => {
      try {
        const provider = getProvider()
        // eth_accounts is non-invasive and returns already-connected addresses.
        const accounts: string[] = await provider.send('eth_accounts', [])
        setWallet(accounts[0] ?? null)

        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      } catch (err) {
        console.warn('Wallet sync skipped:', err)
      }
    }

    syncFromProvider()

    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccounts = (accounts: string[]) => setWallet(accounts[0] ?? null)
    const handleChain = (id: string) => setChainId(parseInt(id, 16))
    const handleDisconnect = () => {
      setWallet(null)
      setChainId(null)
    }

    window.ethereum.on('accountsChanged', handleAccounts)
    window.ethereum.on('chainChanged', handleChain)
    window.ethereum.on('disconnect', handleDisconnect)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccounts)
      window.ethereum?.removeListener('chainChanged', handleChain)
      window.ethereum?.removeListener('disconnect', handleDisconnect)
    }
  }, [])

  const handleConnect = useCallback(async () => {
    if (!window.ethereum) {
      window.alert('MetaMask is not installed.')
      return
    }
    setConnecting(true)
    try {
      const provider = getProvider()
      const accounts: string[] = await provider.send('eth_requestAccounts', [])
      setWallet(accounts[0] ?? null)

      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
    } catch (err) {
      console.error('Wallet connect failed:', err)
      window.alert('Failed to connect wallet. Check console for details.')
    } finally {
      setConnecting(false)
    }
  }, [])

  const handleSwitch = useCallback(async () => {
    if (!window.ethereum) {
      window.alert('MetaMask is not installed.')
      return
    }
    setConnecting(true)
    try {
      const provider = getProvider()
      // wallet_requestPermissions opens the MetaMask account picker.
      await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }])
      const accounts: string[] = await provider.send('eth_accounts', [])
      setWallet(accounts[0] ?? null)

      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
    } catch (err) {
      console.error('Wallet switch failed:', err)
      // Fallback: try a plain requestAccounts which also opens MetaMask.
      try {
        const provider = getProvider()
        const accounts: string[] = await provider.send('eth_requestAccounts', [])
        setWallet(accounts[0] ?? null)

        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      } catch (fallbackErr) {
        console.error('Wallet fallback connect failed:', fallbackErr)
        window.alert('Failed to open MetaMask for wallet selection.')
      }
    } finally {
      setConnecting(false)
    }
  }, [])

  const walletLabel =
    wallet
      ? `${wallet}`
      : wallet ?? 'Not connected'

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl">

      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {chainName}
        </span>
        <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-sm font-mono text-slate-100 shadow-inner shadow-white/5">
          {walletLabel}
        </span>
        <button
          onClick={() => void (wallet ? handleSwitch() : handleConnect())}
          disabled={connecting}
          className="ml-auto rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/15 disabled:opacity-60"
        >
          {wallet ? 'Switch wallet' : 'Connect wallet'}
        </button>
      </div>
    </header>
  )
}
