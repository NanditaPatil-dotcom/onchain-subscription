'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/stats'
import { FloatingOrbs } from '@/components/floating-orbs'
import Prism from '@/components/Prism'
import ApprovePaymentModal from '@/components/ApprovePaymentModal'

export default function Home() {
  const [showApprove, setShowApprove] = useState(false)

  return (
    <div className="dark relative min-h-screen overflow-hidden">
      {/* Prism Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      {/* Fallback gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 opacity-60" />

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-1">
        <FloatingOrbs />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Navbar />
        <Hero />
        <HowItWorks />
      </motion.div>

      {/* Floating demo trigger for Approve modal */}
      <motion.button
        onClick={() => setShowApprove(true)}
        className="fixed bottom-6 right-6 z-20 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/30 backdrop-blur transition hover:border-white/30 hover:bg-white/15"
        whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(124,58,237,0.35)' }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        Demo Approve
      </motion.button>

      <ApprovePaymentModal
        open={showApprove}
        onClose={() => setShowApprove(false)}
        onSign={() => setShowApprove(false)}
        amount="0.12"
        token="ETH"
        nonce={12}
        expiry={300}
      />
    </div>
  )
}
