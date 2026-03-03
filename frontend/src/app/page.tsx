"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/features/landing/HeroSection"

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
