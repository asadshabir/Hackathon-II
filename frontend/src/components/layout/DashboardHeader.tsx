"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  CheckSquare, LayoutDashboard, ListTodo, LogOut,
  User, MessageSquare, CalendarDays, BarChart3, Settings,
} from "lucide-react"

/**
 * DashboardHeader — AMOLED mobile-first
 *
 * Mobile : slim 56px true-black bar — logo + avatar only.
 *          Navigation is in MobileBottomNav (not here).
 * Desktop: full horizontal nav + user chip + sign-out.
 */

interface DashboardHeaderProps {
  onSignOut: () => void
  userEmail?: string
}

const navItems = [
  { label: "Dashboard",  href: "/dashboard",           icon: LayoutDashboard },
  { label: "AI Chat",    href: "/dashboard/chat",       icon: MessageSquare   },
  { label: "Todos",      href: "/dashboard/todos",      icon: ListTodo        },
  { label: "Calendar",   href: "/dashboard/calendar",   icon: CalendarDays    },
  { label: "Analytics",  href: "/dashboard/analytics",  icon: BarChart3       },
  { label: "Settings",   href: "/dashboard/settings",   icon: Settings        },
]

export function DashboardHeader({ onSignOut, userEmail }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b border-white/[0.06] bg-black/92"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="w-full flex items-center justify-between px-4">

        {/* ── Logo ─────────────────────────────────────── */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center"
            style={{ boxShadow: "0 0 14px rgba(139,92,246,0.55)" }}
          >
            <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight leading-none">
            TaskFlow
          </span>
        </Link>

        {/* ── Desktop nav ──────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${active
                      ? "bg-violet-600/20 text-violet-400"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.06]"
                    }
                  `}
                  style={
                    active
                      ? { boxShadow: "0 0 0 1px rgba(139,92,246,0.25), 0 0 12px rgba(139,92,246,0.1)" }
                      : undefined
                  }
                >
                  <item.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.8} />
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* ── Right section ────────────────────────────── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {userEmail && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.06]">
              <User className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-white/55 max-w-[130px] truncate">{userEmail}</span>
            </div>
          )}

          {/* Desktop sign out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="hidden md:flex items-center gap-1.5 text-white/45 hover:text-rose-400 hover:bg-rose-500/10 h-8 px-2.5 rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Sign Out</span>
          </Button>

          {/* Mobile: avatar chip — tap to sign out */}
          <button
            onClick={onSignOut}
            className="md:hidden w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Sign out"
          >
            <User className="w-4 h-4 text-violet-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
