"use client"

import Link from "next/link"
import { CheckCircle2, Sparkles, Zap, Star } from "lucide-react"

/**
 * HeroSection — Deep Indigo professional landing
 */

export function HeroSection() {
  const features = [
    { icon: CheckCircle2, text: "Smart Task Management", color: "#10B981", bg: "rgba(16,185,129,0.09)" },
    { icon: Sparkles,     text: "AI-Powered Assistant",  color: "#6366F1", bg: "rgba(99,102,241,0.09)"  },
    { icon: Zap,          text: "Lightning Fast",         color: "#38BDF8", bg: "rgba(56,189,248,0.09)"  },
    { icon: Star,         text: "Priority System",        color: "#F59E0B", bg: "rgba(245,158,11,0.09)"  },
  ]

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-24"
      style={{ background: "#0A0B0F" }}
    >
      {/* Single soft indigo glow behind content */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">

        {/* AI badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background: "rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.22)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: "#818CF8" }}>
            Powered by Gemini AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
          Organize Your Life
          <br />
          <span className="gradient-violet-cyan">With Intelligence</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(255,255,255,0.48)" }}
        >
          AI-powered task management with smart prioritization,
          natural language commands, and beautiful insights.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14">
          <Link href="/signup">
            <button
              className="h-11 px-8 rounded-xl text-sm font-bold text-white min-w-[160px] transition-all duration-150 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 0 20px rgba(99,102,241,0.30)",
              }}
            >
              Get Started Free
            </button>
          </Link>
          <Link href="/signin">
            <button
              className="h-11 px-8 rounded-xl text-sm font-semibold min-w-[160px] transition-all duration-150 active:scale-95"
              style={{
                color: "rgba(255,255,255,0.68)",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Sign In
            </button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl"
                style={{
                  background: f.bg,
                  border: `1px solid ${f.color}20`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}18` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: f.color }} strokeWidth={2} />
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  {f.text}
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
