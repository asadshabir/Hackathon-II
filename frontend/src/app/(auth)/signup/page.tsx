"use client"

import { SignUpForm } from "@/components/features/auth/SignUpForm"
import Link from "next/link"
import { CheckSquare, Star, Sparkles, ArrowLeft } from "lucide-react"

const highlights = [
  "AI-powered task creation from natural language",
  "Real-time sync across all your devices",
  "Smart recurring tasks & reminders",
  "Full analytics & productivity insights",
]

export default function SignUpPage() {
  return (
    <div
      className="relative flex min-h-screen"
      style={{ background: "#0A0B0F" }}
    >
      {/* ── Ambient blobs ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06]"
          style={{ background: "#4F46E5" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.04]"
          style={{ background: "#10B981" }}
        />
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

      {/* ── Left panel — form ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 order-2 lg:order-1">
        <div className="w-full max-w-[400px] space-y-7">

          {/* Back link (mobile) + Mobile logo */}
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/signin" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 0 16px rgba(99,102,241,0.35)",
              }}
            >
              <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Heading */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#818CF8",
                }}
              >
                Free forever
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="text-sm mt-1.5 text-white/40">
              Start managing tasks smarter in 30 seconds
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
            <SignUpForm />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-white/35">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel (hidden on mobile) ────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-12 relative border-l border-white/[0.05] order-1 lg:order-2">
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
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
                Everything included, free
              </span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              The smartest
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #38BDF8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                todo app.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/40 leading-relaxed max-w-sm">
              Stop switching between apps. TaskFlow combines AI chat, task management, and analytics in one place.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">{item}</span>
              </li>
            ))}
          </ul>

          {/* Rating */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-white/50">
              <span className="text-white/80 font-semibold">4.9/5</span> from 500+ users
            </p>
          </div>
        </div>

        <p className="text-xs text-white/20">© 2026 TaskFlow · No credit card required</p>
      </div>
    </div>
  )
}
