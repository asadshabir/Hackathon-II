"use client"

import Link from "next/link"
import { CheckCircle2, Sparkles, Zap, Star } from "lucide-react"

/**
 * HeroSection — AMOLED landing page hero
 * True black with violet/cyan gradient accents and electric icon pills.
 */

export function HeroSection() {
  const features = [
    { icon: CheckCircle2, text: "Smart Task Management", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
    { icon: Sparkles,    text: "AI-Powered Assistant",  color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
    { icon: Zap,         text: "Lightning Fast",         color: "#06B6D4", bg: "rgba(6,182,212,0.12)"  },
    { icon: Star,        text: "Priority System",        color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-24 bg-black">

      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-12 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">

        {/* AI badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
          style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.25)" }}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 tracking-wide">Powered by Gemini AI</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Organize Your Life
          <br />
          <span className="gradient-violet-cyan">With Intelligence</span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-lg text-white/45 mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience task management like never before — AI assistance, smart prioritization,
          and an interface built for AMOLED screens.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
          <Link href="/signup">
            <button
              className="h-12 px-8 rounded-2xl text-sm font-bold text-white min-w-[180px] transition-all duration-150 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                boxShadow: "0 0 24px rgba(139,92,246,0.45)",
              }}
            >
              Get Started Free
            </button>
          </Link>
          <Link href="/signin">
            <button
              className="h-12 px-8 rounded-2xl text-sm font-semibold min-w-[180px] transition-all duration-150 active:scale-95 border"
              style={{
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Sign In
            </button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border"
                style={{ background: f.bg, borderColor: `${f.color}25` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}20`, boxShadow: `0 0 12px ${f.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-white/65 text-center leading-tight">{f.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
