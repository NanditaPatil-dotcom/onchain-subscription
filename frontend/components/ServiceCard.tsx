'use client'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

type ServiceCardProps = {
  name: string
  description: string
  token: 'ETH' | 'USDC' | string
  amount: string
  selected?: boolean
  onClick?: () => void
}

export default function ServiceCard({
  name,
  description,
  token,
  amount,
  selected = false,
  onClick,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition',
        'bg-white/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-400/80 focus:ring-offset-2 focus:ring-offset-slate-950',
        selected
          ? 'border-purple-400/70 shadow-[0_15px_45px_rgba(124,58,237,0.35)]'
          : 'border-white/10 hover:border-purple-400/40 hover:shadow-[0_16px_50px_rgba(59,130,246,0.28)]',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-purple-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h3 className="mt-1 text-lg font-semibold text-white">{name}</h3>
          <p className="mt-1 text-sm text-slate-300">{description}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md'
          )}
        >
          EIP-712 consent
        </span>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-sm text-slate-200">
        <span className="text-base font-semibold text-white">{amount} / month</span>
        {selected && (
          <span className="rounded-full border border-purple-300/40 bg-purple-400/10 px-3 py-1 text-[11px] font-semibold text-purple-100">
            Selected
          </span>
        )}
      </div>

      {selected && (
        <div className="pointer-events-none absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-purple-500/50 via-indigo-500/40 to-sky-400/40 opacity-60 blur-[6px]" />
      )}
    </button>
  )
}
