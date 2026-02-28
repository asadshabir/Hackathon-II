"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, Zap, Star } from "lucide-react"

/**
 * Hero Section Component
 *
 * Clean, performance-optimized landing page hero with clear CTA hierarchy
 * No heavy animations - CSS transitions only
 */

export function HeroSection() {
  const features = [
    { icon: CheckCircle2, text: "Smart Task Management" },
    { icon: Sparkles, text: "AI-Powered Assistant" },
    { icon: Zap, text: "Lightning Fast" },
    { icon: Star, text: "Priority System" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm text-white font-medium">Powered by AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          Organize Your Life
          <br />
          <span className="text-white drop-shadow-lg">With Ease</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience task management like never before with AI assistance,
          smart prioritization, and an interface designed for productivity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 py-6 h-auto min-w-[180px]">
              Get Started Free
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto min-w-[180px]">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-5 rounded-xl neumorphic"
            >
              <feature.icon className="w-7 h-7 text-indigo-600" />
              <span className="text-sm text-slate-700 font-medium text-center">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle background decorations - static, no animation */}
      <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl opacity-50" />
    </section>
  )
}
