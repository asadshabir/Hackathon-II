"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CheckSquare, Menu, X, LayoutDashboard, ListTodo, LogOut, User, MessageSquare, CalendarDays, BarChart3, Settings } from "lucide-react"

/**
 * DashboardHeader Component
 *
 * Premium header for authenticated dashboard with navigation, theme toggle, and user menu
 * Clean design with solid backgrounds and CSS-only transitions
 */

interface DashboardHeaderProps {
  onSignOut: () => void
  userEmail?: string
}

export function DashboardHeader({ onSignOut, userEmail }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    },
    {
      label: "AI Chat",
      href: "/dashboard/chat",
      icon: MessageSquare,
      active: pathname === "/dashboard/chat"
    },
    {
      label: "Todos",
      href: "/dashboard/todos",
      icon: ListTodo,
      active: pathname === "/dashboard/todos"
    },
    {
      label: "Calendar",
      href: "/dashboard/calendar",
      icon: CalendarDays,
      active: pathname === "/dashboard/calendar"
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      active: pathname === "/dashboard/analytics"
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname === "/dashboard/settings"
    },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 md:backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors duration-150">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                TaskFlow
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
                Dashboard
              </span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm
                    transition-colors duration-150 flex items-center gap-2
                    ${item.active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {userEmail && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                    {userEmail}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={onSignOut}
              className="flex items-center gap-2 text-sm hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-white" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="absolute top-16 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 space-y-4">
              {/* User Info */}
              {userEmail && (
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150
                        ${item.active
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:bg-slate-700" />

              {/* Sign Out Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
