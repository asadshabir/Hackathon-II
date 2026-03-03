"use client"

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0B0F" }}>
        <div
          className="w-9 h-9 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "#6366F1",
            borderRightColor: "rgba(99,102,241,0.25)",
          }}
        />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative min-h-screen bg-background">
      <DashboardHeader onSignOut={signOut} userEmail={user?.email} />
      <main className="container mx-auto px-4 pt-14 pb-24 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  )
}
