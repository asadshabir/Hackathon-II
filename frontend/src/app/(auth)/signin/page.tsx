"use client"

import { SignInForm } from "@/components/features/auth/SignInForm"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 neumorphic card-lift">
          {/* Premium accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />
          <div className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
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
                  <span className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 text-slate-500 dark:text-slate-400">New to our platform?</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="block text-center text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 neumorphic px-4 py-2 rounded-lg inline-block"
              >
                Create an account →
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
