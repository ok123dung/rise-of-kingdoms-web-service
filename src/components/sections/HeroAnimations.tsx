'use client'

import { Crown, Shield, Sparkles } from 'lucide-react'

export function HeroAnimations() {
  return (
    <div className="absolute inset-0">
      <div className="animate-float absolute left-10 top-20">
        <Crown className="h-8 w-8 text-amber-400/30" />
      </div>
      <div className="animate-float absolute right-20 top-40" style={{ animationDelay: '2s' }}>
        <Shield className="h-6 w-6 text-blue-400/30" />
      </div>
      <div className="animate-float absolute bottom-32 left-20" style={{ animationDelay: '4s' }}>
        <Sparkles className="h-10 w-10 text-amber-300/20" />
      </div>
      <div className="animate-float absolute left-1/2 top-60" style={{ animationDelay: '1s' }}>
        <Crown className="h-6 w-6 text-amber-500/20" />
      </div>
    </div>
  )
}

export function HeroStats() {
  return (
    <>
      <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">1000+</div>
      <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">500+</div>
      <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">4.9/5</div>
    </>
  )
}
