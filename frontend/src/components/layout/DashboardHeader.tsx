"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  CheckSquare, LayoutDashboard, ListTodo, LogOut,
  User, MessageSquare, CalendarDays, BarChart3, Settings,
} from "lucide-react"

interface DashboardHeaderProps {
  onSignOut: () => void
  userEmail?: string
}

const navItems = [
  { label: "Dashboard",  href: "/dashboard",          icon: LayoutDashboard },
  { label: "AI Chat",    href: "/dashboard/chat",      icon: MessageSquare   },
  { label: "Todos",      href: "/dashboard/todos",     icon: ListTodo        },
  { label: "Calendar",   href: "/dashboard/calendar",  icon: CalendarDays    },
  { label: "Analytics",  href: "/dashboard/analytics", icon: BarChart3       },
  { label: "Settings",   href: "/dashboard/settings",  icon: Settings        },
]

export function DashboardHeader({ onSignOut, userEmail }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
      style={{
        background: "rgba(10,11,15,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="w-full flex items-center justify-between px-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
          >
            <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">TaskFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={
                    active
                      ? {
                          background: "rgba(99,102,241,0.15)",
                          color: "#818CF8",
                          boxShadow: "0 0 0 1px rgba(99,102,241,0.2)",
                        }
                      : {
                          color: "rgba(255,255,255,0.45)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"
                    if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.80)"
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"
                    if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"
                  }}
                >
                  <item.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.8} />
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {userEmail && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <User className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
              <span className="text-xs max-w-[130px] truncate" style={{ color: "rgba(255,255,255,0.50)" }}>
                {userEmail}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.40)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Sign Out</span>
          </Button>

          {/* Mobile avatar */}
          <button
            onClick={onSignOut}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
            aria-label="Sign out"
          >
            <User className="w-4 h-4" style={{ color: "#818CF8" }} />
          </button>
        </div>
      </div>
    </header>
  )
}
