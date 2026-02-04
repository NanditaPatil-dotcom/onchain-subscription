export function Hero() {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">

        {/* Main Headline */}
        <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight text-balance">
          <span className="text-white">Subscriptions, with</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            cryptographic consent
          </span>
        </h1>

        {/* Subheading */}
        <p className="mb-12 text-lg md:text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
          Enable seamless, gas-optimized recurring payments with on-chain consent verification. Give users control. Eliminate intermediaries.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 rounded-full bg-purple-600 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
            Launch App
          </button>
          <button className="px-8 py-4 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-200 font-semibold hover:bg-purple-500/20 hover:border-purple-500/70 transition-all duration-300 backdrop-blur-sm">
            How it works
          </button>
        </div>
      </div>
    </section>
  )
}
