"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CheckSquare, Menu, X } from "lucide-react"

/**
 * Landing Header — AMOLED dark glass style
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Features",     href: "#features"    },
    { label: "How It Works", href: "#how-it-works" },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b border-white/[0.06] bg-black/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <nav className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center"
              style={{ boxShadow: "0 0 14px rgba(139,92,246,0.5)" }}
            >
              <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[15px] text-white tracking-tight">TaskFlow</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white/45 hover:text-white/85 transition-colors duration-150 font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="text-white/55 hover:text-white hover:bg-white/[0.06] text-sm h-8 px-3 rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <button
                className="h-8 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95"
                style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
              >
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen
                ? <X    className="w-4 h-4 text-white/70" />
                : <Menu className="w-4 h-4 text-white/70" />
              }
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute top-14 left-4 right-4 rounded-2xl overflow-hidden"
            style={{ background: "#111111", boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px rgba(0,0,0,0.95)" }}
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-white/[0.06] my-2" />
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-white/55 hover:text-white hover:bg-white/[0.06] rounded-xl h-10">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)" }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
