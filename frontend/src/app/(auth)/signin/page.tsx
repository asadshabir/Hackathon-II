"use client"

import { SignInForm } from "@/components/features/auth/SignInForm"
import Link from "next/link"
import { CheckSquare } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-black">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full opacity-6 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              boxShadow: "0 0 32px rgba(139,92,246,0.5)",
            }}
          >
            <CheckSquare className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#0F0F0F",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.9)",
          }}
        >
          <SignInForm />

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-sm text-white/35">New here?</p>
            <Link
              href="/signup"
              className="inline-block mt-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
