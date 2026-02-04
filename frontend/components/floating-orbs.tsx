'use client'

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 - Purple */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 opacity-20 blur-3xl animate-pulse"
        style={{
          animation: 'float 15s ease-in-out infinite',
        }}
      />

      {/* Orb 2 - Blue */}
      <div
        className="absolute top-1/2 right-20 w-96 h-96 rounded-full bg-gradient-to-l from-blue-600 to-blue-400 opacity-15 blur-3xl animate-pulse"
        style={{
          animation: 'float 20s ease-in-out infinite 2s',
        }}
      />

      {/* Orb 3 - Purple-Blue */}
      <div
        className="absolute bottom-32 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-10 blur-3xl"
        style={{
          animation: 'float 25s ease-in-out infinite 4s',
        }}
      />

      {/* Add animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-30px) translateX(20px);
          }
          50% {
            transform: translateY(-60px) translateX(-20px);
          }
          75% {
            transform: translateY(-30px) translateX(20px);
          }
        }
      `}</style>
    </div>
  )
}
