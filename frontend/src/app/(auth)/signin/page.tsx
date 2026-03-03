"use client"

import { SignInForm } from "@/components/features/auth/SignInForm"
import Link from "next/link"
import { CheckSquare } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ background: "#0A0B0F" }}>
      {/* Subtle background gradient — one soft indigo blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 65%)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)",
            }}
          >
            <CheckSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#111318",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <SignInForm />

          <div
            className="mt-6 pt-5 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>New here?</p>
            <Link
              href="/signup"
              className="inline-block mt-2 text-sm font-semibold transition-colors"
              style={{ color: "#818CF8" }}
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
