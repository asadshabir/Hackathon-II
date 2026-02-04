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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 mb-8">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Powered by AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          Organize Your Life
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">With Ease</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience task management like never before with AI assistance,
          smart prioritization, and an interface designed for productivity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 py-6 h-auto min-w-[180px] shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow duration-150">
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
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-150"
            >
              <feature.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium text-center">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle background decorations - static, no animation */}
      <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-indigo-100 dark:bg-indigo-950/40 blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-purple-100 dark:bg-purple-950/40 blur-3xl opacity-50" />
    </section>
  )
}
