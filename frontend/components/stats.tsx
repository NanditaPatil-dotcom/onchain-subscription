import { label } from "framer-motion/client"

export function Stats() {
  const stats = [
    {
      label: 'Gasless Approvals',
      value: '98%',
      description: 'Reduced transaction costs',
    },
    {
      label: 'Built on Ethereum',
      value: 'EVM',
      description: 'Cross-chain compatible',
    },
  ]

  return (
    <section className="relative z-10 px-6 py-20 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-blue-500/5 p-8 backdrop-blur-md hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Glassmorphism glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

              <div className="relative z-10">
                <p className="text-sm text-purple-300 mb-2">{stat.label}</p>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-purple-200">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
