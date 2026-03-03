"use client"

/**
 * Dashboard Layout — AMOLED mobile-first
 *
 * Mobile : 56px top header + 64px bottom nav. Content gets
 *          pt-14 (header) + pb-20 (bottom nav clearance).
 * Desktop: 56px header only. No bottom nav.
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { signOut, user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "#8B5CF6",
            borderRightColor: "rgba(139,92,246,0.3)",
            boxShadow: "0 0 16px rgba(139,92,246,0.4)",
          }}
        />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top header */}
      <DashboardHeader onSignOut={signOut} userEmail={user?.email} />

      {/* Main content
          Mobile : pt-14 (header) + pb-20 (bottom nav + safe area)
          Desktop: pt-14 (header) + pb-8
      */}
      <main className="container mx-auto px-4 pt-14 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <MobileBottomNav />
    </div>
  )
}
