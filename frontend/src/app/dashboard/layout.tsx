"use client"

/**
 * Dashboard Layout
 *
 * Protected layout for authenticated users with premium header
 * Clean, performance-optimized design with solid backgrounds
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { FloatingChatButton } from "@/components/ui/floating-chat-button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { signOut, user, isLoading, isAuthenticated } = useAuth()

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Enhanced Header */}
      <DashboardHeader onSignOut={signOut} userEmail={user?.email} />

      {/* Main Content with top padding for fixed header */}
      <main className="container mx-auto px-4 py-8 pt-28">{children}</main>

      {/* Floating Chat Button - Mobile friendly shortcut */}
      <FloatingChatButton />
    </div>
  )
}
