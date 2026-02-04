"use client"

import { SignInForm } from "@/components/features/auth/SignInForm"
import { GlassCard } from "@/components/ui/glass-card"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-white dark:bg-slate-950">
      <div className="w-full max-w-md">
        <GlassCard className="overflow-hidden">
          {/* Premium accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />
          <div className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to continue to your account
              </p>
            </div>

            {/* Form */}
            <SignInForm />

            {/* Footer */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400">New to our platform?</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="block text-center text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Create an account →
              </Link>
            </div>
          </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
