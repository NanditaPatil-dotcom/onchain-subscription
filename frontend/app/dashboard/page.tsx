'use client'

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
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-600/25 blur-[120px]" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute inset-x-10 bottom-0 h-64 rounded-[32px] bg-gradient-to-r from-purple-700/25 via-blue-700/15 to-emerald-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
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
            <button className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15">
              New subscription
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <article
                key={sub.service}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-5 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20"
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
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-purple-600  px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition hover:shadow-[0_15px_40px_rgba(59,130,246,0.35)]"
                    disabled={sub.status === 'Paid'}
                    aria-disabled={sub.status === 'Paid'}
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
                </div>

                <div className="relative mt-4 h-px w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
                <p className="relative mt-3 text-xs text-slate-400">
                  Secure, non-custodial approvals routed through your escrow.
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
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
