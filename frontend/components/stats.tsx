const steps = [
  {
    title: 'Connect wallet',
    description:
      'Use MetaMask to authenticate. We never custody keys or funds—everything stays in your wallet.',
  },
  {
    title: 'Approve subscription',
    description:
      'Sign an EIP-712 permit to authorize recurring payments with on-chain, tamper-proof consent.',
  },
  {
    title: 'Automated renewals',
    description:
      'Our contract executes renewals on schedule; revoke anytime from your dashboard or wallet.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 min-h-screen flex items-center px-6 py-20 border-t border-purple-500/20 bg-black/20"
    >
      <div className="max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-300/80">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Consent-first recurring payments in three steps
          </h2>
          <p className="text-purple-200/90 max-w-2xl mx-auto">
            Connect, sign, and let the smart contract handle the rest—revocable at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-500/10 to-blue-500/5 p-8 backdrop-blur-md hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

              <div className="relative z-10 space-y-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/20 text-purple-100 text-sm font-semibold border border-purple-400/30">
                  {idx + 1}
                </span>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-purple-200 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
