'use client'

import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Stats } from '@/components/stats'
import { FloatingOrbs } from '@/components/floating-orbs'
import LiquidEther from '@/components/liquid-ether'

export default function Home() {
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
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
      </div>
    </div>
  )
}
