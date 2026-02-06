'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/stats'
import { FloatingOrbs } from '@/components/floating-orbs'
import LiquidEther from '@/components/liquid-ether'
import ApprovePaymentModal from '@/components/ApprovePaymentModal'

export default function Home() {
  const [showApprove, setShowApprove] = useState(false)

  return (
    <div className="dark relative min-h-screen overflow-hidden">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
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
