"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  const isNetworkError =
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("NetworkError")

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white/90">
            {isNetworkError ? "Connection Error" : "Something went wrong"}
          </h2>
          <p className="text-slate-600 dark:text-white/45">
            {isNetworkError
              ? "Unable to connect to the server. Please check your internet connection and ensure the backend is running."
              : "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        {!isNetworkError && (
          <p className="text-xs text-slate-400 dark:text-white/25">
            Error: {error.message}
          </p>
        )}
      </div>
    </div>
  )
}
