"use client"

import { SignInForm } from "@/components/features/auth/SignInForm"
import Link from "next/link"
import { CheckSquare, Zap, Shield, Bell, ArrowRight } from "lucide-react"

const features = [
  { icon: Zap,       label: "AI Task Management",  desc: "Create and manage tasks with natural language" },
  { icon: Bell,      label: "Smart Reminders",      desc: "Never miss a deadline with intelligent alerts"  },
  { icon: Shield,    label: "Secure & Private",     desc: "Your data is encrypted and never shared"        },
]

export default function SignInPage() {
  return (
    <div
      className="relative flex min-h-screen"
      style={{ background: "#0A0B0F" }}
    >
      {/* ── Ambient background blobs ───────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: "#4F46E5" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05]"
          style={{ background: "#38BDF8" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Left panel (hidden on mobile) ─────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-12 relative border-r border-white/[0.05]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >
            <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">TaskFlow</span>
        </div>

        {/* Main content */}
        <div className="space-y-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400/70 mb-3">
              Your AI Productivity Partner
            </p>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Get more done
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #818CF8 0%, #38BDF8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                with AI.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/40 leading-relaxed max-w-sm">
              Manage tasks naturally. Just type what you need — your AI assistant handles the rest.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#818CF8" }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{f.label}</p>
                    <p className="text-sm text-white/35 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Social proof chip */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
            }}
          >
            <div className="flex -space-x-1.5">
              {["#F59E0B", "#10B981", "#6366F1"].map((c) => (
                <div key={c} className="w-6 h-6 rounded-full border-2 border-[#0A0B0F]" style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs text-white/50">
              <span className="text-white/80 font-semibold">1,200+</span> tasks completed today
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-xs text-white/20">
          © 2026 TaskFlow · Built with AI
        </p>
      </div>

      {/* ── Right panel — form ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Mobile logo */}
          <div className="flex flex-col items-center lg:hidden">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 0 24px rgba(99,102,241,0.4)",
              }}
            >
              <CheckSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TaskFlow</h1>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm mt-1.5 text-white/40">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#111318",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <SignInForm />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-white/35">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              Create one free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
