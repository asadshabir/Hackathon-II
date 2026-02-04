"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

/**
 * Floating Chat Button
 *
 * A sun/sparkle-shaped floating action button for quick chatbot access
 * Optimized for mobile with 56px touch target
 */
export function FloatingChatButton() {
  return (
    <Link
      href="/dashboard/chat"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-150 md:bottom-8 md:right-8"
      aria-label="Open AI Chatbot"
    >
      {/* Sun/Sparkle rays effect */}
      <div className="absolute inset-0 rounded-full">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-150" />
      </div>

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20" style={{ animationDuration: '2s' }} />

      {/* Icon */}
      <Sparkles className="w-6 h-6 relative z-10" />
    </Link>
  )
}
